var HMS_version = location.origin.indexOf('localhost') == -1 ? (new Date().getTime() + '@hms') : (new Date().toLocaleDateString() + '@dev');

seajs.config({
    base: "/",
    alias: {
        "layer": "components/layer/layer.source.js",
        "date": "components/DatePicker/WdatePicker.js",
        "grid": "components/grid/index.js",
        "jquery": "components/jquery.min.js",
        "icheck": "components/icheck.js",
        "page": "components/page.js",
        "handlebars": "components/handlebars.js",
        "handlebars2": "components/handlebars-v4.0.10.js",
        "upload": "components/upload.js",
        "form":"components/jquery.form.js",
        "validate":"components/validate.js",
        "tools":"components/tools.js",
        "select2":"components/select2.full.js",
        "area":"components/area/area.js",
        "ajax":"components/ajax.js",
        'cropper':'components/cropper/index.js',
        'drag':'components/drag.js',
        'localStorage':'components/localStorage.js',
        'mapArea':'components/mapArea/mapArea.js',
        'bootstrap':'components/bootstrap.min.js',
        'triStateCb': 'components/tristate/jquery.tristate.js',
        'moment': 'components/moment.min.js'
    },
    preload: ["seajsCss", "jquery", "grid", "layer", "select2", "ajax"],
    map: [
        [/^(.*\.(?:css|js))(.*)$/i,'$1?V='+HMS_version+'_iframe']
    ]
});
