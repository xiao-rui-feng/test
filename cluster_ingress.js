/**
 */

//初始化nginx table和resthub table
var cluster_name = $('#nm_name').html();
var $nginx_table=$("#nginx-table");
var $resthub_table=$("#resthub-table");
init_cluster_upstream();
init_cluster_resthub();

//加载nginx table和resthub table 数据
$('#proxy_index').on('click', function () {
    load_cluster_upstream();
    load_cluster_resthub();
    setTimeout_table();
});

//初始化nginx table
function init_cluster_upstream() {
    $nginx_table.bootstrapTable({
        data: [],
        singleSelect: false,
        clickToSelect: true,
        datalocale: "zh-US", //表格汉化
        sortName : 'namespace',
        sortOrder : 'asc',
        striped: false,
        classes: 'table table-hover',
        columns: [
            {
                field: 'ID',
                align: 'center',
                valign: 'middle',
                width: '5%',
                visible:false,
                formatter: function (value, row, index) {
                    return '<a role="button" class="btn btn-xs btn-info disabled">' +
                        '&nbsp;<span class="glyphicon glyphicon-list" aria-hidden="true"></span>&nbsp;' +
                        '</a>';
                }
            },
            {
                title: '配置环境',
                field: 'namespace',
                align: 'center',
                valign: 'middle',
                width: '100px'
            },
            {
                title: 'Nginx IP',
                field: 'nginx_ip',
                align: 'center',
                valign: 'middle',
                width: '140px'
            },
            {
                title: '更新时间',
                field: 'exe_time',
                align: 'center',
                valign: 'middle',
                width: '180px'
            },
            {
                title: '更新进度',
                field: 'exe_proc',
                align: 'center',
                valign: 'middle',
                width: '130px'
            },
            {
                title: '更新状态',
                field: 'exe_status',
                align: 'center',
                valign: 'middle',
                width: '100px',
                formatter: function (value, row, index) {
                    if(row.exe_status==1){
                        var a = '<h5><span class="label label-success">成功</span><h5>';
                    }else if(row.exe_status==0){
                        var a = '<h5><span class="label label-danger">失败</span><h5>';
                    }else {
                        var a = '<h5><span class="label label-warning">未知</span><h5>';
                    }
                    return a;
                }
            },
            {
                title: 'pool名称',
                field: 'pool_name',
                align: 'center',
                valign: 'middle'
            },
            {
                title: '更新的集群IP',
                field: 'upstream_ip',
                align: 'center',
                valign: 'middle'
            }
        ]
    });
}

//初始化resthub-table
function init_cluster_resthub() {
    $resthub_table.bootstrapTable({
        data: [],
        singleSelect: false,
        clickToSelect: true,
        striped: false,
        showHeader: true,
        datalocale: "zh-US", //表格汉化
        sortName: "tag",
        sortOrder: "asc",
        pagination: true,
        pageSize: 15,
        sidePagination: "client",
        classes: 'table table-hover',
        columns: [
            {
                title: 'resthub环境',
                field: 'tag',
                align: 'center',
                valign: 'middle',
                width: '100px',
                //sortable: true,
                formatter: function (value, row, index) {
                    var a='<span class="label label-primary">'+ value +'</span>';
                    return a;
                }
            },
            {
                title: 'IP',
                field: 'ip',
                align: 'center',
                valign: 'middle'
            },
            {
                title: '端口',
                field: 'port',
                align: 'center',
                valign: 'middle'
            },
            {
                title: '更新时间',
                field: 'update_time',
                align: 'center',
                valign: 'middle'
            },
            {
                title: '状态',
                field: 'is_enabled',
                align: 'center',
                valign: 'middle',
                formatter: function (value, row, index) {
                    if(value){
                        var a='<span class="label label-success">启用中</span>';
                    }else{
                        var a='<span class="label label-danger">禁用中</span>';
                    }
                    return a;
                }
            }
        ]
    });
}

//    加载namespace环境下的upstream信息
function load_cluster_upstream() {
    $.ajax({
        method: "POST",
        traditional: true,
        url: "/ingress/load_cluster_upstream",
        data: {
            cluster_name: cluster_name,
            namespace: JSON.stringify(namespace_list)
        },
        dataType: "json",
        success: function (data) {
            if (data.status) {
                load_nginx_table(data.info)
            }
        }
    });
}

// 加载nginx-table,合并相同项
function load_nginx_table(data){
    $nginx_table.bootstrapTable('load', data);
    for (var index = 0; index < data.length; index++){
        var namespace = data[index].namespace;
        console.log("index", index);
        for(var j = index + 1; j < data.length; j++){
            var namespace_next = data[j].namespace;
            if(namespace != namespace_next ){
                $nginx_table.bootstrapTable('mergeCells', {index: index, field: 'namespace', colspan: 1, rowspan:j-index});
                console.log({index: index, field: 'namespace', colspan: 1, rowspan:j-index});
                index = j - 1;
                break;
            }else if(j==data.length-1){
                    j+=1;
                    console.log(index,j-index);
                    $nginx_table.bootstrapTable('mergeCells', {index: index, field: 'namespace', colspan: 1, rowspan:j-index});
                    index = j - 1;
            }
        }
    }
}


// 加载resthub-table
function load_cluster_resthub() {
    $.ajax({
        method: "POST",
        url: "/ingress/load_cluster_resthub",
        data: {
            cluster_name: cluster_name
        },
        dataType: "json",
        success: function (data) {
            if (data.status) {
                load_cluster_resthub_all(data.info);
            }
            else {
                $("#resthub-conf").replaceWith("<h4>"+data.info+"</h4>")
            }
        }
    });
}

// 加载所有环境下的resthub配置
function load_cluster_resthub_all(data){
    var html = '<div ><label for="env-select">配置环境：</label>' +
            '<select id="env-select">' +
            '<option value="ALL">ALL</option>' +
            '</select></div>' +
            '<br>' +
            '<div class="table-responsive">' +
            '<table id="resthub-table"' +
            'data-classes="table table-bordered table-condensed"' +
            'data-striped="true"></table>'+
            '</div>';
    $("#resthub-conf").replaceWith(html);
    var env_select = $("#env-select")
    env_select.css('width', '150px').select2({
                    minimumResultsForSearch: Infinity,
                    data: data["env"]
                });
    env_select.val("ALL");
    $resthub_table.bootstrapTable('load',data["env_result"]);
    //    selece变化时，重新reload表格数据
    $("#env-select").on("change",function(){
        var env = $("#env-select").val();
        $.ajax({
            method: "POST",
            url: "/ingress/load_cluster_resthub_env",
            data: {
                cluster_name: cluster_name,
                env: env
            },
            dataType: "json",
            success: function (data) {
                if (data.status) {
                    $resthub_table.bootstrapTable('load',data.info);
                }
                else {
                    alert(data.info);
                }
            }
        });
    });

}

var time_nginx_table;
var time_reshub_table;
// 定时加载指定namespace的pod列表
function setTimeout_table() {
    time_nginx_table = setInterval(settime_load_nginx_table, 3000);
	time_reshub_table = setInterval(settime_load_reshub_table, 3000);
}

//    加载nginx table信息
function settime_load_nginx_table() {
    $.ajax({
        method: "POST",
        traditional: true,
        url: "/ingress/load_cluster_upstream",
        data: {
            cluster_name: cluster_name,
            namespace: JSON.stringify(namespace_list)
        },
        dataType: "json",
        success: function (data) {
            if (data.status) {
                var old_data = $nginx_table.bootstrapTable('getData');
                var new_data = data.info;
                if (!cmp(new_data, old_data)) {
                    $nginx_table.bootstrapTable("load", data.info);
                    var nginx_data = $nginx_table.bootstrapTable('getData');
                    for (var index = 0; index < nginx_data.length; index++){
                        var namespace = nginx_data[index].namespace;
                        console.log("index", index);
                        for(var j = index + 1; j < nginx_data.length; j++){
                            var namespace_next = nginx_data[j].namespace;
                            if(namespace != namespace_next ){
                                $nginx_table.bootstrapTable('mergeCells', {index: index, field: 'namespace', colspan: 1, rowspan:j-index});
                                console.log({index: index, field: 'namespace', colspan: 1, rowspan:j-index});
                                index = j - 1;
                                break;
                            }else if(j==nginx_data.length-1){
                                j+=1;
                                console.log(index,j-index);
                                $nginx_table.bootstrapTable('mergeCells', {index: index, field: 'namespace', colspan: 1, rowspan:j-index});
                                index = j - 1;
                            }
                        }
                    }
                }else{
                    clearInterval(time_nginx_table);
                }
            }else{
                clearInterval(time_nginx_table);
                alert(data.info);
            }
        }
    });
}

function settime_load_reshub_table(){
    $.ajax({
        method: "POST",
        url: "/ingress/load_cluster_resthub",
        data: {
            cluster_name: cluster_name
        },
        dataType: "json",
        success: function (data) {
            if (data.status) {
                var old_data = $resthub_table.bootstrapTable('getData');
                var new_data = data.info;
                if (!cmp(new_data, old_data)) {
                    $resthub_table.bootstrapTable("load", data.info);
                    var resthub_data = $resthub_table.bootstrapTable('getData');
                    for (var index = 0; index < resthub_data.length; index++){
                        var namespace = resthub_data[index].namespace;
                        for(var j = index + 1; j < resthub_data.length; j++){
                            var namespace_next = resthub_data[j].namespace;
                            if(namespace != namespace_next ){
                                $resthub_table.bootstrapTable('mergeCells', {index: index, field: 'namespace', colspan: 1, rowspan:j-index});
                                index = j - 1;
                                break;
                            }else if(j==resthub_data.length-1){
                                j+=1;
                                $resthub_table.bootstrapTable('mergeCells', {index: index, field: 'namespace', colspan: 1, rowspan:j-index});
                                index = j - 1;
                            }
                        }
                    }
                }else{
                    clearInterval(time_resthub_table);
                }
            }else{
                clearInterval(time_resthub_table);
                alert(data.info);
            }
        }
    });
}
