<style>
.modal-container{background-color:#909090}
#mg-chart g.row text, #frm-chart g.row text, #depo-chart g.row text, #j-pengadaan-chart g.row text, #supplier-chart g.row text {fill:#000}
div.result div.row {padding-left:10px}
</style>
<div class="box-content" id="app">
	<main class="main">
		<form class="form-horizontal" role="form">
		<div class="form-group">
			<label class="col-sm-1 control-label">Transaksi *</label>
			<div class="col-sm-3">
				<select v-model="report.transaksi">
						<option value="m">Barang Masuk</option>
						<option value="k">Barang Keluar</option>
				</select>
			</div>
		</div>
		<div class="form-group">
			<label class="col-sm-1 control-label">Tanggal *</label>
			<div class="col-sm-2"><input autocomplete="off" id="tgl_dari" v-model="report.tgl_dari" type="text" value="" class="form-control" ></div><div class="col-sm-2"><input autocomplete="off" id="tgl_sampai" v-model="report.tgl_sampai" type="text" value="" class="form-control" ></div>
		</div>
		<div class="form-group">
			<label class="col-sm-1 control-label">&nbsp;</label>
			<div class="col-sm-1"><button @click.prevent="getDataReport()" class="btn btn-primary" id="btn-get-data">Load Data</button></div>
			<div class="col-sm-3">
			{{report.status_data}}
			</div>
			<div v-bind:class="{ hide : report.data_obat_status }">
				<div class="col-sm-3">
				<button @click.prevent="renewData()" class="btn btn-primary">Perbarui Data</button>
				</div>
				<div class="col-sm-3">
				{{report.status_data_obat}}
				</div>
			</div>
		</div>
		</form>
	</main>
	<div class="result">
	<div class="row hide" id="search-obat">
		<div class="chart-wrapper">
			<div class="form-group">
				<label>Filter Item</label>
				<div class="col-sm-3">
					<select name="filter-item" multiple="">
						<option value=""></option>
					</select>
				</div>
				<div class="col-sm-3">
					<input type="button" value="Filter" id="doFilterItem">
				</div>
			</div>					
		</div>
	</div>
	<div class="row">
		<div class="chart-wrapper" id="total-rupiah">
			<div class="chart-title">  <strong> Total Rupiah (HNA+PPn) </strong> </div>					
		</div>
	</div>
	<div class="row">
		<div class="chart-wrapper col-sm-6" id="menu-select">
			<div class="chart-title">  <strong> Pilih Item </strong> </div>					
		</div>
	</div>
	<div class="row">
		<div id="daily-chart">
			<strong>Daily Chart Transaksi</strong>
			<span class="reset" style="display: none;">range: <span class="filter"></span></span>
			<a class="reset" href="javascript:PerolehanChart.filterAll();PerolehanChart.filterAll();dc.redrawAll();"
			   style="display: none;">reset</a>
			<div class="clearfix"></div>
		</div>
		<div id="perolehan-chart">
		</div>
	</div>
	<div id="div-masuk" class="row hide">
		<div id="status-waktu-chart">
			<strong>Waktu Transaksi</strong>
			<a class="reset" href="javascript:SWChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
			<div class="clearfix"></div>
		</div>
		<div id="j-pengadaan-chart">
			<strong>Jenis Pengadaan</strong>
			<a class="reset" href="javascript:jPengadaanChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
			<a class="invert" href="javascript:invertChart.init('j-pengadaan-chart');" style="display: none;">invert</a>
			<div class="clearfix"></div>
		</div>
		<div id="supplier-chart">
			<strong>Supplier</strong>
			<a class="reset" href="javascript:SupplierChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
			<a class="invert" href="javascript:invertChart.init('supplier-chart');" style="display: none;">invert</a>
			<div class="clearfix"></div>
		</div>
	</div>
	<div class="row">
		<div id="transaksi-chart">
			<strong>Jenis Transaksi</strong>
			<a class="reset" href="javascript:TransaksiChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
			<div class="clearfix"></div>
		</div>
		<div id="mg-chart">
			<strong>Material Group</strong>
			<a class="reset" href="javascript:MGChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
			<a class="invert" href="javascript:invertChart.init('mg-chart');" style="display: none;">invert</a>
			<div class="clearfix"></div>
		</div>
		<div id="frm-chart">
			<strong>Formularium</strong>
			<a class="reset" href="javascript:FrmChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
			<a class="invert" href="javascript:invertChart.init('frm-chart');" style="display: none;">invert</a>
			<div class="clearfix"></div>
		</div>
	</div>
	<div id="div-keluar" class="row hide">
		<div id="pelanggan-chart">
			<strong>Jenis Pelanggan</strong>
			<a class="reset" href="javascript:PelangganChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
			<div class="clearfix"></div>
		</div>
	</div>
	<div class="row">
		<div id="depo-chart">
			<strong>Depo</strong>
			<a class="reset" href="javascript:DepoChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
			<a class="invert" href="javascript:invertChart.init('depo-chart');" style="display: none;">invert</a>
			<div class="clearfix"></div>
		</div>
	</div>
	<div class="row">
		<div class="row hide" id="special_k1">
			<div class="col-sm-2"><button id="show-special-k1" @click.prevent="report.K1 = true" class="btn btn-success">Keterangan Resep</button></div>
			<modal_resep v-if="report.K1" @close="report.K1 = false">
			<h3 slot="header">Dashboard Resep</h3>
			<ul id="list_k1_item">
			</ul>
			</modal_resep>
		</div>
	</div>
	<hr></hr>
	<div class="row">
		<div class="col-sm-2"><button id="show-item" @click.prevent="modalItem = true" class="btn">List Item</button></div>			
		<modal v-if="modalItem" @close="modalItem = false">
		<h3 slot="header">List Item</h3>
		<ul id="list_item">
		</ul>
		</modal>
	</div>
	<div class="row hide">
	</div>
	</div>
</div>

<script type="text/x-template" id="modal-item">
  <transition name="modal">
    <div class="modal-mask" id="modal-list-item">
      <div class="modal-wrapper">
        <div class="modal-container">
			<div class="modal-header"><slot name="header">default header</slot></div>

        <div class="modal-body">
            <slot name="body">
			<div class="row">
				<table class="table table-hover" id="info-table">
				</table>
			</div>
			</slot>
          <div class="modal-footer">
            <slot name="footer">
			  <button class="modal-default-button" id="btnExport">
                Export
              </button>
			  <button class="modal-default-button" @click.prevent="$emit('close')">
                Close
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
    </div>
  </transition>
</script>
<script type="text/x-template" id="modal-resep">
  <transition name="modal_resep">
    <div class="modal-mask" id="modal-d-resep">
      <div class="modal-wrapper">
        <div class="modal-container">
			<div class="modal-header"><slot name="header">default header</slot></div>

        <div class="modal-body">
            <slot name="body">
			<div class="row">
				<div class="chart-wrapper" id="total-perolehan" style="padding-right: 15px;">
					<div class="chart-title">  <strong> Total Perolehan </strong> </div>			
				</div>
				<div class="chart-wrapper" id="total-resep" style="padding-right: 15px;">
					<div class="chart-title">  <strong> Total Lembar Resep </strong> </div>			
				</div>
				<div class="chart-wrapper" id="total-eresep" style="padding-right: 15px;">
					<div class="chart-title">  <strong> Total Lembar Resep Dari EResep </strong> </div>			
				</div>
			</div>			
			<div class="row" style="padding: 20px 0;">
				<div id="asal-resep">
					<strong>Asal</strong>
					<a class="reset" href="javascript:asalChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
					<div class="clearfix"></div>
				</div>
			</div>
			<div id="exp-resep-eresep" class="hide">
			<div class="row" style="padding: 20px 0;">
				<div>
					<strong>Tabel Harian</strong>
					<table class="table table-hover" id="harian-table">
					</table>
				</div>
			</div>
			<div class="row" style="padding: 20px 0;">
				<div>
					<strong>Tabel Asal</strong>
					<table class="table table-hover" id="asal-table">
					</table>
				</div>
			</div>
			</div>
			<div class="row" style="padding: 20px 0;">
				<div id="op-resep">
					<strong>Pembuat Resep</strong>
					<a class="reset" href="javascript:opChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
					<div class="clearfix"></div>
				</div>
				<div id="sp-resep">
					<strong>Spesialis Pembuat Resep</strong>
					<a class="reset" href="javascript:spChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
					<div class="clearfix"></div>
				</div>
			</div>
			</slot>
          <div class="modal-footer">
            <slot name="footer">
			  <button class="modal-default-button" @click.prevent="$emit('close')">
                Close
              </button>
			  <button class="modal-default-button" id="btnExportREr">
                Export Resep-Eresep
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
    </div>
  </transition>
</script>