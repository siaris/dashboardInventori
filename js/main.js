let rRawK1 = []

const item_list = Vue.component('modal', {
  template: '#modal-item',
  data() {
	return{
			item: []
		}
	},
	mounted() {
		this.simpanItem()
		this.fetchItem()
		initExport()
		return
	},
	methods:{
		simpanItem(){
			var item_filtered = {}
			for(item of ndx.allFiltered()){
				if(item.k in item_filtered){
					//append
					item_filtered[item.k]['total'] += item.q*item.h
					item_filtered[item.k]['q'] += parseFloat(item.q)
				}else{
					//bikin baru
				item_filtered[item.k] = {
					k : item.k,
					nm : item.nm,
					q : parseFloat(item.q),
					total : (item.q*item.h),
					s2 : item.s2
				}
				}
			}
			this.item = Object.values(item_filtered)
			return
		},
		fetchItem(){
			viewItem(this.item)
			return
		},
	}
})

const resep_comp = Vue.component('modal_resep', {
  template: '#modal-resep',
  data() {
	return{
			item: []
		}
	},
	mounted() {
		this.fetchItem()
		return
	},
	methods:{
		async fetchItem(){
			if(rRawK1.length == 0)
				await this.getData(0)
			else
				chartResep()
			return
		},
		async getData(rgidx){
			//ambil data resep
			let d = new FormData()
				d.append('d', app.report.dateRg[rgidx][0])
				d.append('s', app.report.dateRg[rgidx][1]) 
			axios.post(BASEURL+'/hidden/tools/load_data_resep/', d,{ crossdomain: false })
			.then(async (resp) => {
				for(f in resp.data[0]){
					rRawK1.push(resp.data[0][f])
				}
				if(typeof app.report.dateRg[rgidx + 1] !== 'undefined')
					await this.getData(rgidx + 1)
				else
					chartResep()
			})
			return
			
		}
	}
})

const app = new Vue({
	el:'#app',
	data() {
		return {
			all_item: {},
			all_item_ref: {},
			all_kunj_ref: {},
			modalItem: false,
			report:{
				dateRg: [],
				tgl_dari:"php:date('d-m-Y')",
				tgl_sampai:"php:date('d-m-Y')",
				transaksi:'m',
				status_data:'Tidak Ada Data',
				data_obat_status: true,
				status_data_obat: 'Data Obat',
				rRaw:[],
				rRefHNA:[],
				K1: false
			}
		}
	},
	mounted: function(){
		$('#btn-get-data').addClass('disabled')
		
		this.fetchDataRef()
		$('#btn-get-data').removeClass('disabled')
		
		//this.fetchDatePicker()		
	},
	methods:{
		async fetchDataRef(){
			//get jasa
			// this.fetchJasa()
			//get pasien
			// this.fetchPasien()
			//get referensi pasien
			await this.fetchAllItem(true)
			await this.fetchRefItem()
		},
		fetchAllItem(isInit){
			if(!!localStorage.getItem("all_item_inventory")){
				this.all_item = JSON.parse(localStorage.getItem("all_item_inventory"))
			}else{
				axios.get(ROOTURL+'/devapi/api/inventori/item/all/',{ crossdomain: false })
				.then((resp) => {
					for(d of resp.data){
						this.all_item[d.id] = d;
					}
					localStorage.setItem('all_item_inventory', JSON.stringify(this.all_item));
					if(isInit === false){
						this.report.status_data_obat = 'Data Obat Terbarui'
						$('#btn-get-data').removeClass('disabled')
						this.data_obat_status = true
					}
				})
			}
			return;
		},
		async renewData(){
			this.report.status_data_obat = 'Tunggu, Data Obat Sedang Diperbarui'
			localStorage.setItem('all_item_inventory', '');
			await this.fetchAllItem(false)
			return
		},
		fetchRefItem(){
			axios.get(ROOTURL+'/devapi/api/inventori/ref_item/all/',{ crossdomain: false })
			.then((resp) => {
				for(d of resp.data){
					this.all_item_ref[d.id] = d.n;
				}
			})
		},
		fetchKunjunganRef(){
			this.all_kunj_ref = {}
			foo = (PrimaSession.user_id == '3246')?'ref_all':'all_ref';
			axios.get(ROOTURL+'/devapi/api/master_ref_kunjungan/'+foo+'/',{ crossdomain: false })
			.then((resp) => {
				for(d of resp.data){
					this.all_kunj_ref[d.id] = d.n;
				}
			})
			return
		},
		getHRef(){
			var data = new FormData();
			data.append('tgl_dari', this.report.tgl_dari)
			data.append('tgl_sampai', this.report.tgl_sampai)
			axios.post(BASEURL+'/hidden/tools/load_data_ref_harga_inv/', data, {crossdomain: false})
			.then((resp) => {
				if(resp.data.length > 0){
					app.report.rRefHNA = resp.data
				}
			})
		},
		setDefault(){
			this.report.rRaw = []
			this.report.rRefHNA = []
			rRawK1 = []
			$('#btn-get-data').addClass('disabled')
		},
		async getDataReport(){
			this.setDefault()
			this.report.tgl_dari = $('#tgl_dari').val()
			this.report.tgl_sampai = $('#tgl_sampai').val()
			this.report.status_data = 'Tunggu, Tgl Sedang Dikalkulasi'
			//dapatkan referensi harga
			await this.getHRef()
			//kalkulasi banyak hari 
			let dC = moment(this.report.tgl_sampai,'DD-MM-YYYY').diff(moment(this.report.tgl_dari,'DD-MM-YYYY'), 'days')+1
			let mx = app.report.transaksi == 'k'?3:56
			let dT = []
			if(dC > mx){
				let it = Math.floor(dC/mx)
				let sisa = dC % mx;
				let k = 0
				let next = ''
				let first = this.report.tgl_dari
				for(i=0;i < it;i++ ){ 
					last = moment(first,'DD-MM-YYYY').add((mx-1),'days').format('DD-MM-YYYY')
					dT.push([first,last])
					first = moment(last,'DD-MM-YYYY').add(1,'days').format('DD-MM-YYYY')
				}
				if(sisa > 0)
					dT.push([first,moment(first,'DD-MM-YYYY').add((sisa-1),'days').format('DD-MM-YYYY')])
			}else{
				dT.push([this.report.tgl_dari,this.report.tgl_sampai])
			}
			this.report.dateRg = dT
			this.report.status_data = 'Tunggu, Data Sedang Diambil'
			this.fetchData(0)
			return
		},
		async fetchData(dtI){
			let d = new FormData()
			d.append('tgl_dari', this.report.dateRg[dtI][0])
			d.append('tgl_sampai', this.report.dateRg[dtI][1])
			d.append('transaksi', app.report.transaksi)
			axios.post(BASEURL+'/hidden/tools/load_data_inventori/', d, {crossdomain: false})
			.then(async (resp) => {
				if(resp.data.length > 0) app.report.rRaw = app.report.rRaw.concat(resp.data[0])
				if(typeof app.report.dateRg[dtI + 1] !== 'undefined') await this.fetchData(dtI + 1)
				else{
					if(app.report.rRaw.length < 1){
						app.report.status_data = 'Data Transaksi Kosong'
						$('#btn-get-data').removeClass('disabled')
						return
					}
					nah([app.report.rRaw,app.report.rRefHNA[0]])
				}
			})
		}
	}
})

var data_transaksi = data_ref_h = {}
var dateFormat = d3.timeParse("%Y-%m-%d %H:%M:%S");
var dateRefH = d3.timeParse("%y%m");
var transaksi = {
	'm1' : 'penerimaan',
	'm2' : 'resep retur',
	'm3' : 'adjusmen masuk',
	'k1' : 'resep',
	'k2' : 'obat ruangan',
	'k3' : 'bmhp',
	'k4' : 'adjusmen keluar'
}
var jenisResep = {
	'BE' : 'Resep Bebas',
	'RJ' : 'Resep RJ',
	'RI' : 'Resep RI'
}
var statusWaktu = {
	'1' : 'Jam Kerja',
	'2' : 'Diluar Jam Kerja',
	'3' : 'Dini Hari'
}

$(document).ready(function(){
	$('#tgl_dari,#tgl_sampai').datepicker({"format": "dd-mm-yyyy", "weekStart": 1, "autoclose": true});
	dailyChart = dc.lineChart('#daily-chart');
	PerolehanChart = dc.barChart('#perolehan-chart');
	jPengadaanChart = dc.rowChart('#j-pengadaan-chart');
	SupplierChart = dc.rowChart('#supplier-chart');
	TransaksiChart = dc.pieChart('#transaksi-chart');
	MGChart = dc.rowChart('#mg-chart');
	FrmChart = dc.rowChart('#frm-chart');
	SWChart = dc.pieChart('#status-waktu-chart');
	PelangganChart = dc.pieChart('#pelanggan-chart');
	// UnitChart = dc.rowChart('#unit-chart');
	DepoChart = dc.rowChart('#depo-chart');
	// infoTable = dc.dataTable('#info-table');
	// cntKunjungan = dc.numberDisplay('#total-kunjungan');
	sumRupiah = dc.numberDisplay("#total-rupiah");
	itemSelect = dc.selectMenu('#menu-select')
	// cntPendaftaran = dc.numberDisplay("#total-pendaftaran");
	// cntPasien = dc.numberDisplay("#total-pasien");
	// mapChart = dc.geoChoroplethChart('#map-chart');
})

function buildRefH(data){
	data_ref_h = {}
	for(d of data){
		data_ref_h[d.kh] = d.h;
	}
	app.report.rRefHNA = []
}


function getPelanggan(tr,d){
	var val = 'barang masuk'
	if(app.report.transaksi === 'k'){
		if(in_array(tr,['k1','k2'])){
			val = (d === 'RJ')?'Rawat Jalan':((d === 'RI')?'Rawat Inap':'Bebas')
		}else{
			val = (tr == 'k3')?'bmhp':'adjusmen'
		}
	}
	return val
}

function getStatusWaktu(d,h,m,tr){
	var val = 1
	if(in_array(h,[22,23,0,1,2,3,4,5,6])){
		val = 3
	}else if(in_array(d,[0,6]))
		val = 2
	else if(h < 8 && m < 31)
		val = 2
	else if(h > 15)
		val = 2
	return val;
}

const first = function(data,callback){
	local_d = []
	if(isObjEmpty(data[1])) setTimeout(function(){buildRefH(data[1]);}, 3000)
	else buildRefH(data[1])   
	var i =0
	for (d of data[0]) {
		if (typeof app.all_item[d.k] === 'undefined'){ 
			app.report.data_obat_status = false
			alert('Perbarui Data Obat Dahulu')
			return;
		}
		local_d.push(d)
		local_d[i].p = getPelanggan(d.tr,d.id)
		local_d[i].nm = app.all_item[d.k]['n']
		local_d[i].m = app.all_item[d.k]['m']
		local_d[i].s = app.all_item[d.k]['s']
		local_d[i].f = app.all_item[d.k]['f']
		local_d[i].s2 = app.all_item[d.k]['s2']
		local_d[i].s3 = app.all_item[d.k]['s3']
		local_d[i].h = (d.h === '')?parseFloat(data_ref_h[d.t.substring(2, 4)+d.t.substring(5, 7)+d.k]):parseFloat(d.h)
		local_d[i].d = (d.tr === 'm1')?'208':d.d
		local_d[i].gbg = d.d+d.k
		if(isNaN(d.h)) local_d[i].h = 0
		
		all = d.t
		local_d[i].t = dateFormat(d.t);
		local_d[i].ts = getStatusWaktu(d.t.getDay(),parseInt(all.substring(11,13)),parseInt(all.substring(14,16)),d.tr)
		local_d[i].j = (typeof d.j === 'undefined')?'':d.j
		local_d[i].s1 = (typeof d.s1 === 'undefined')?'':d.s1
		
		if(d.q.toString().indexOf(',') > -1){
			var q_sp = local_d[i].q.split(",");
			var u_sp = local_d[i].u.split(",");
			//remove object elem q dan u
			delete local_d[i].q
			delete local_d[i].u
			//save to temp
			var temp_elem = local_d[i]
			var j = 0
			//pop
			local_d.pop()
			for (t of q_sp) {
				//push new and add elem q dan u
				local_d.push({...temp_elem,...{q:parseFloat(t),u:u_sp[j]}});
				i+=1
				j+=1
			}
		}else{
			local_d[i].q = parseFloat(local_d[i].q)
			i+=1
		}
	}
	callback()
	
	return local_d
}

//generate
function finalF(error, data){
	if(typeof ndx !== 'undefined'){
		dc.filterAll()
		dc.redrawAll()
	}

	if(app.report.transaksi == 'm'){
		$('#div-masuk').removeClass('hide');
		$('#div-keluar').addClass('hide');
	}else{
		$('#div-keluar').removeClass('hide');
		$('#div-masuk').addClass('hide');
		app.fetchKunjunganRef()
	}
	
	ndx = crossfilter(local_d);
	all = ndx.groupAll();
	totalRupiah = ndx.groupAll().reduceSum(function(d) {return d.h*d.q;});
	dateDimension = ndx.dimension(function (d) { 		return d.t; 	});
	itemDimension = ndx.dimension(function (d) { 		return d.nm; 	});
	trDimension = ndx.dimension(function (d) { 		return d.tr; 	});
	MGDimension = ndx.dimension(function (d) { 		return d.m; 	});
	FrmDimension = ndx.dimension(function (d) { 		return d.f; 	});
	DepoDimension = ndx.dimension(function (d) { 		return d.d; 	});
	JPDimension = ndx.dimension(function (d) { 		return d.j; 	});
	SupplierDimension = ndx.dimension(function (d) { 		return d.s1; 	});
	SWDimension = ndx.dimension(function (d) { 		return d.ts; 	});
	PelangganDimension = ndx.dimension(function (d) { 		return d.p; 	});
	// infoDimension = ndx.dimension(function (d) {return d.k;});
	var suppChartHeight = SupplierDimension.group().all().length * 30
	
	dateGroup = dateDimension.group().reduceSum(function(d) {return d.h*d.q;});
	trGroup = trDimension.group().reduceSum(function(d) {return d.h*d.q;});
	MGGroup = MGDimension.group().reduceSum(function(d) {return d.h*d.q;});
	FrmGroup = FrmDimension.group().reduceSum(function(d) {return d.h*d.q;});
	DepoGroup = DepoDimension.group().reduceSum(function(d) {return d.h*d.q;});
	JPGroup = JPDimension.group().reduceSum(function(d) {return d.h*d.q;});
	SupplierGroup = SupplierDimension.group().reduceSum(function(d) {return d.h*d.q;});
	SWGroup = SWDimension.group().reduceSum(function(d) {return d.h*d.q;});
	PelangganGroup = PelangganDimension.group().reduceSum(function(d) {return d.h*d.q;});
	itemGroup = itemDimension.group().reduceSum(function(d) {return d.q;});
	
	minDate = dateDimension.bottom(1)[0].t;
	maxDate = dateDimension.top(1)[0].t;

	data_ref_h = {}
	local_d = []
	
	itemSelect
	.dimension(itemDimension)
	.multiple(true)
    .group(itemGroup);
	
	sumRupiah
	.formatNumber(d3.format(',.2f'))
	.valueAccessor(function(d){return d; })
	.group(totalRupiah);
	
	dailyChart 
	.renderArea(true)
	.width(1200)
	.height(300)
	.margins({top: 30, right: 50, bottom: 25, left: 40})
	.dimension(dateDimension)
	.x(d3.scaleTime().domain([minDate, maxDate]))
	.xUnits(d3.timeDays)
	.elasticY(true)
	.renderHorizontalGridLines(true)
	.rangeChart(PerolehanChart)
	.brushOn(false)
	.group(dateGroup, 'Transaksi Harian')
	.valueAccessor(function (d) {
		return d.value;
	})
	
	PerolehanChart
	.width(1200)
	.height(40)
	.margins({top: 0, right: 50, bottom: 20, left: 40})
	.dimension(dateDimension)
	.group(dateGroup)
	.centerBar(true)
	.gap(1)
	.x(d3.scaleTime().domain([minDate, maxDate]))
	.alwaysUseRounding(true)
	.xUnits(d3.timeDays);
	
	TransaksiChart 
        .width(250)
        .height(250)
        .radius(200)
        .dimension(trDimension)
        .group(trGroup)
        .label(function (d) {
			let desc = (d.key.indexOf('+') > -1)?amprahDesc.init(d.key):transaksi[d.key]
			return desc
		})
		.title(function (d) {
			let desc = (d.key.indexOf('+') > -1)?amprahDesc.init(d.key):transaksi[d.key]
			return desc+':'+d.value;
		})
		.on('filtered', function() {
			if(in_array('k1',this.filters()))
				$('#special_k1').removeClass('hide')
			else
				$('#special_k1').addClass('hide')
		})
	
	MGChart
        .width(400)
		.height(500)
        .group(MGGroup)
		.dimension(MGDimension)
		// .rowsCap(10)
		.othersGrouper(false)
		// Assign colors to each value in the x scale domain
		// .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
		.label(function (d) {
			return app.all_item_ref[d.key];
		})
		// Title sets the row text
		.title(function (d) {
			return app.all_item_ref[d.key]+':'+d.value;
		})
        .elasticX(true)
		.xAxis().ticks(4);
		
	FrmChart
        .width(400)
		.height(500)
		.group(FrmGroup)
		.dimension(FrmDimension)
		// .rowsCap(10)
		.othersGrouper(false)
		// Assign colors to each value in the x scale domain
		// .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
		.label(function (d) {
			return app.all_item_ref[d.key];
		})
		// Title sets the row text
		.title(function (d) {
			return app.all_item_ref[d.key]+':'+d.value;
		})
        .elasticX(true)
		.xAxis().ticks(4);
		
	DepoChart
        .width(800)
		.height(500)
		.group(DepoGroup)
		.dimension(DepoDimension)
		// .rowsCap(10)
		.othersGrouper(false)
		// Assign colors to each value in the x scale domain
		// .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
		.label(function (d) {
			return app.all_item_ref['d_'+d.key];
		})
		// Title sets the row text
		.title(function (d) {
			return app.all_item_ref['d_'+d.key]+':'+d.value;
		})
        .elasticX(true)
		.xAxis().ticks(4);
	
	SWChart 
        .width(250)
        .height(250)
        .radius(200)
        .dimension(SWDimension)
        .group(SWGroup)
        .label(function (d) {
			return statusWaktu[d.key]
		})
		.title(function (d) {
			return statusWaktu[d.key]+':'+d.value;
		})
		
	PelangganChart 
        .width(250)
        .height(250)
        .radius(200)
        .dimension(PelangganDimension)
        .group(PelangganGroup)
        .label(function (d) {
			return d.key
		})
		.title(function (d) {
			return d.key+':'+d.value;
		})
	
	jPengadaanChart
        .width(400)
		.height(400)
		.group(JPGroup)
		.dimension(JPDimension)
		.othersGrouper(false)
		.label(function (d) {
			var desc = descChoser.init('j',d.key)
			return desc;
		})
		.title(function (d) {
			var desc = descChoser.init('j',d.key)
			return desc+':'+d.value;
		})
        .elasticX(true)
		.xAxis().ticks(4);
	
	SupplierChart
        .width(400)
		.height(suppChartHeight)
		.group(SupplierGroup)
		.dimension(SupplierDimension)
		.othersGrouper(false)
		.label(function (d) {
			var desc = descChoser.init('s1',d.key)
			return desc;
		})
		.title(function (d) {
			var desc = descChoser.init('s1',d.key)
			return desc+':'+d.value;
		})
        .elasticX(true)
		.xAxis().ticks(4);
		
	dc.renderAll()
	app.report.status_data = 'Data Tersedia'
	$('#btn-get-data').removeClass('disabled')
	// $('#menu-select .select2-container').remove()
	// $('#menu-select select').prop('multiple',true).select2().on('change',function(){
		// console.log($(this).val())
	// })
	return
}

function nah(data){
	queue()
      .defer(first, data)
      .await(finalF);
}

function viewItem(dt){
	var infoTable = dc.dataTable('#info-table');
	var ndx_i = crossfilter(dt);
	var all_i = ndx_i.groupAll();
	
	infoDimension = ndx_i.dimension(function (d) {return d.nm;});
	infoTable
		.width(800)
        .showSections(false)
		.dimension(infoDimension)
		.size(Infinity)
		.columns([
			{
                label: 'Kode',
                format: function (d) {
                    return '|'+d.k+'|';
                }
            },{
                label: 'Item',
                format: function (d) {
                    return d.nm;
                }
            },{
                label: 'Kuantitas',
                format: function (d) {
                    return d.q+' '+app.all_item_ref[d.s2];
                }
            },
			{
                label: 'Total',
                format: function (d) {
                    return d.total;
                }
            },
			{
                label: 'Status',
                format: function (d) {
                    return (app.all_item[d.k]['s'] === 's_1')?'Aktif':'Inaktif';
                }
            },
		])
		.sortBy(function (d) { return d.key; })
        .order(d3.descending);
	dc.renderAll()
	return
}

const dataChanger = function(){
	function adder(){
		local_d.push({
			d: '208',
			f: 'f_4',
			gbg: '20801080037.1',
			h: 4303431,j: '2',
			k: "01080037.1",
			m: "m_43",
			nm: "NEW URIC ACID 1300T// ARC",
			p: "barang masuk",
			q: 1,
			s: "s_1",
			s1: "581",
			s2: "s2_39",
			s3: "s3_1.01.04.01.001",
			tr: "m1",
			ts: 1,
			u: "28102317",
			t: dateFormat('2019-01-04 10:23:00')
			})
	}
	function init(){
		adder()
		ndx.remove()
		ndx.add(local_d)
		dc.redrawAll()
		return
	}
	return{
		init:init
	}
}()

const invertChart = function(){
	function inti(id){
		d3.selectAll('#'+id+' rect').each(function(d, i) {
			var onClickFunc = d3.select(this).on("click")
    		onClickFunc.apply(this, [d, i])
		})
	}
	return{
		init : inti
	}
}()

const descChoser = function(){
	function inti(pfx,v){
		let r
		switch(v){
			case 'A':
				r = 'Adjusmen'
				break
			case 'T':
				r = 'Amprah Dummy'
				break
			default:
				r = (typeof app.all_item_ref[pfx+'_'+v] === 'undefined')?'retur penggunaan':app.all_item_ref[pfx+'_'+v]
				break
		}
		return r
	}
	return{
		init: inti
	}
}()

const amprahDesc = function(){
	function inti(str){
		let s = explode('+',str)
		let dp = app.all_item_ref['d_'+s[1]]
		// console.log(dp,s)
		let kon = app.report.transaksi == 'm'?' dari ':' ke '
		return 'amprah '+kon+dp
	}
	return {
		init : inti
	}
}()

function initExport(){
	$("#btnExport").click(function () {
            $("#tblExport").btechco_excelexport({
                containerid: "info-table"
               , datatype: $datatype.Table
            });
    });
}