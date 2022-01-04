let REF_KUNJ = []

function chartResep(){
	let d = rRawK1
	
	specialistGetter = function(){
		function inti(s){
			let sWord = s.match(/Sp\..+?(?=,|$)/g)
			r = (sWord == null)?'':sWord[0].replace("(K)", "").trim()
			return r
		}
		return{
			init: inti
		}
	}()
	
	for (dt of d) {
		dt.cnt = '1'
		dt.eNr = (dt.e != '')?dt.e+''+dt.nr:''
		dt.sp = (isNaN(dt.d) === true)?'ppds':specialistGetter.init(app.all_kunj_ref['k-pg_'+dt.d])
	}
	
	k1Rupiah = dc.numberDisplay("#total-perolehan")
	k1Lembar = dc.numberDisplay("#total-resep")
	k1LembarE = dc.numberDisplay("#total-eresep")
	asalChart = dc.rowChart('#asal-resep');
	opChart = dc.rowChart('#op-resep');
	spChart = dc.rowChart('#sp-resep');
	
	k1Ndx = crossfilter(d)
	k1All = k1Ndx.groupAll()
	
	dimR = k1Ndx.dimension(function(d) { return d.cnt; }) 
	dimE = k1Ndx.dimension(function(d) { return d.eNr; })
	dimA = k1Ndx.dimension(function(d) { return d.a; })
	dimOp = k1Ndx.dimension(function(d) { return d.d; })
	dimSp = k1Ndx.dimension(function(d) { return d.sp; })
	
	let countER = 0;
	
	k1TotalRupiah = k1Ndx.groupAll().reduceSum(function(d) {return d.h;})
	k1TotalLembar = dimR.group().reduceCount()
	k1AGroup = dimA.group().reduceCount()
	k1OpGroup = dimOp.group().reduceCount()
	k1SpGroup = dimSp.group().reduceCount()
	
	
	k1TotalLembarE = dimE.group().reduce(
		function (p, d) {
			if(d.eNr in p.es)
                p.es[d.eNr]+=1;
            else{ 
				p.es[d.eNr] = 1;
				p.e_cnt++;
				countER+=1	
			}
			
            return p;
        },
        function (p, d) {
            p.es[d.eNr]--;
            if(p.es[d.eNr] === 0){
                delete p.es[d.eNr];
				p.e_cnt--;
				countER-=1	
			}
            return p;
        },
        function () {
            return {es: {},e_cnt:0};
        }
	)
	
	k1Rupiah
	.formatNumber(d3.format(',.2f'))
	.valueAccessor(function(d){return d; })
	.group(k1TotalRupiah);
	
	k1Lembar
	.formatNumber(d3.format(',.2f'))
	.dimension(dimR)
	.valueAccessor(function(d){return d.value; })
	.group(k1TotalLembar);
	
	k1LembarE
	.formatNumber(d3.format(',.2f'))
	.dimension(dimE)
	.valueAccessor(function(d){
		let A = k1Ndx.allFiltered()
		let F = 0
		for(iA in A){
			if(A[iA]['e'] == ''){
				F = 1
				break
			}
		}
		return (countER - F); 
	})
	.group(k1TotalLembarE);
	
	asalDescriptor = function(){
		function inti(t){
			desc = app.all_kunj_ref['k-p_'+t]
			if(t == ''){
				desc = 'resep bebas'
			}else if(t.indexOf('.') < 1){
				desc = app.all_kunj_ref['k-rr_'+t]
			}
			return desc
		}
		return{
			init: inti
		}
	}()
	
	let hOR = k1OpGroup.size() < 10?23:13
	
	asalChart
        .width(500)
		.height(k1AGroup.size()*hOR)
		.group(k1AGroup)
		.dimension(dimA)
		.othersGrouper(false)
		.label(function (d) {
			return asalDescriptor.init(d.key)+':'+d.value
		})
		.title(function (d) {
			return asalDescriptor.init(d.key)+':'+d.value
		})
        .elasticX(true)
		.xAxis().ticks(4);
	
	
	
	opChart
        .width(400)
		.height(k1OpGroup.size()*hOR)
		.group(k1OpGroup)
		.dimension(dimOp)
		.othersGrouper(false)
		.label(function (d) {
			if(isNaN(d.key) === true) return d.key+':'+d.value
			return app.all_kunj_ref['k-pg_'+d.key]+':'+d.value
		})
		.title(function (d) {
			if(isNaN(d.key) === true) return d.key+':'+d.value
			return app.all_kunj_ref['k-pg_'+d.key]+':'+d.value
		})
        .elasticX(true)
		.xAxis().ticks(4);
	
	spChart
        .width(300)
		.height(900)
		.group(k1SpGroup)
		.dimension(dimSp)
		.othersGrouper(false)
		.label(function (d) {
			desc = (d.key == '')?'bukan spesialis':d.key
			return desc+':'+d.value
		})
		.title(function (d) {
			return app.all_kunj_ref['k-pg_'+d.key]+':'+d.value
		})
        .elasticX(true)
		.xAxis().ticks(4);
	
	
	dc.renderAll()
	
	let stBuilder= function(){
		function inti(idx){
			let rT = {}
			for (i in k1Ndx.all()){
				switch(idx){
					case 'a': if(k1Ndx.all()[i][idx] == '') k1Ndx.all()[i][idx] = 'rbe'
						break
					default: 
						break
				}
				if(k1Ndx.all()[i][idx] in rT){
					rT[k1Ndx.all()[i][idx]]['A'] += 1
					if(k1Ndx.all()[i]['e'] != '') rT[k1Ndx.all()[i][idx]]['e'] += 1
				}else{
					rT[k1Ndx.all()[i][idx]] = {
						A: 1,
						e: 0
					}
					if(k1Ndx.all()[i]['e'] != '') rT[k1Ndx.all()[i][idx]]['e'] += 1
				}
			}
			return rT
		}
		return{ init: inti}
	}()
	let dStatic = stBuilder.init('a')
	let dateStatic = stBuilder.init('t')
	let tableDrawer = function(){
		function inti(d,idx){
			let tb = {
				a: ['Asal','asal-table'],
				t: ['Tgl(ydm)','harian-table']
			}
			
			let t = `<thead><tr>
			<th>`+tb[idx][0]+`</th>
			<th>RESEP</th>
			<th>ERESEP</th>
			<th>RESEP MANUAL</th>
			<th>%ERESEP</th>
			<th>%MANUAL</th>
			</tr></thead><tbody>`
			for(i in d){
				if(i == 'rbe')
					continue
				
				switch(idx){
					case 'a': desc = asalDescriptor.init(i)
						break
					default : desc = i
						break
				}
				
				t += `<tr>
				<td>`+desc+`</td>
				<td>`+d[i]['A']+`</td>
				<td>`+d[i]['e']+`</td>
				<td>`+(d[i]['A']-d[i]['e'])+`</td>
				<td>`+parseFloat(100*(d[i]['e'] / d[i]['A'])).toFixed(2)+`%</td>
				<td>`+parseFloat(100*((d[i]['A']-d[i]['e'])/d[i]['A'])).toFixed(2)+`%</td>
				</tr>`
			}
			t += `</tbody>`
			$('#'+tb[idx][1]).append(t)
		}
		return{
			init:inti
		}
	}()
	
	
	
	if(Object.size(dStatic) > 0) tableDrawer.init(dStatic,'a')
	if(Object.size(dateStatic) > 0) tableDrawer.init(dateStatic,'t')
		
	$("#btnExportREr").click(function () {
            $("#tblExport").btechco_excelexport({
                containerid: "exp-resep-eresep"
               , datatype: $datatype.Table
            });
    });
	
	
	return
	
}