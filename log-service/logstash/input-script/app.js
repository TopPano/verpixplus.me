var async = require('async');
var AwsCli = require('aws-cli-js');

var aws = new AwsCli({
      aws_access_key_id: process.env.AWS_KEY_ID, 
      aws_secret_access_key: process.env.AWS_KEY_SECRET,
});


var region = 'ap-northeast-1';
var tag = 'production';
var filters = 'Name=tag:Env,Values='+tag;

var metrics = ['CPUUtilization'];
var namespace = ['AWS/EC2'];


var statistics = ['Average'];


process.env.TZ = 'Europe/Amsterdam' 
// ==== get current timestamp in Taiwan timezone
function getCurTs(callback){
    var curr_timestamp = new Date();
    callback(null, curr_timestamp.toISOString());
}


// ==== request for all instance's id which are filtered
function getInstanceId(args, callback){
    aws.command('ec2 describe-instances --region '+args.region+' --filters '+args.filters).
        then(function (data) {
            var reserv = data.object.Reservations;
            var insts;
            var reserv_idx, inst_idx;
            var result = [];
            for (reserv_idx = 0; reserv_idx < reserv.length; reserv_idx++){
                insts = reserv[reserv_idx].Instances;
                for(inst_idx = 0; inst_idx < insts.length; inst_idx++){
    	    	    result.push(insts[inst_idx].InstanceId);
                }
            }
            callback(null, result);
    });
}



// ==== request for metrics of instances
function getMetrics(currTs, instanceIds){
    var d = new Date(currTs);
    var utc = d.getTime();
    // sub 15 minutes
    utc = utc - 900000;
    var startTs = new Date(utc).toISOString();
    var result = [];

    var aws_q = async.queue(function (task, callback) {
            aws.command('cloudwatch get-metric-statistics --metric-name '+task.metric+' --start-time '+startTs+' --end-time '+currTs+' --period 300 --region '+region+' --namespace '+task.namespace+' --statistics Average --dimensions Name=InstanceId,Value='+task.instanceId).then(
                function(data){
                    var tmp;
                    var j;
                    for(j=0; j<data.object.Datapoints.length; j++){
                        tmp = {};  
                        tmp['instanceId'] = task.instanceId;
                        tmp['metric'] = data.object.Datapoints[j];
                        tmp['metric']["type"] = task.metric;
                        result.push(tmp);
                    }
                    callback()
                });
    }, 5);

    async.each(instanceIds, 
            function(instanceId){
                aws_q.push({instanceId: instanceId, metric:"CPUUtilization", namespace:"AWS/EC2"}, function(){/*console.log("finish "+instanceId);*/});
                aws_q.push({instanceId: instanceId, metric:"MemoryUtilization", namespace:"System/Linux"}, function(){/*console.log("finish "+instanceId);*/});
            }, 
            function(err){console.log(err);})

    aws_q.drain = function() {
           console.log(JSON.stringify(result, null, 2))
    }
}



async.parallel([
        getCurTs, 
        getInstanceId.bind(null, {"region":region, "filters": filters})], 
    function(err, res){
        getMetrics(res[0], res[1]);
    });





