var async = require('async');
var AwsCli = require('aws-cli-js');

var aws = new AwsCli({
      aws_access_key_id: process.env.AWS_KEY_ID, 
      aws_secret_access_key: process.env.AWS_KEY_SECRET,
});


var region = 'ap-northeast-1';
var tag = 'verpixplus';
var filters = 'Name=tag:Env,Values='+tag;

var metrics = [{'idName': 'InstanceId', 'namespace': 'AWS/EC2', 'metric':'CPUUtilization', 'statistics': ['Average', 'Maximum', 'Minimum']},
               {'idName': 'InstanceId', 'namespace': 'System/Linux', 'metric':'MemoryUtilization', 'statistics': ['Average', 'Maximum', 'Minimum']},
               {'idName': 'VolumeId', 'namespace': 'AWS/EBS', 'metric':'VolumeWriteOps', 'statistics': ['Average', 'Maximum', 'Minimum']},
               {'idName': 'VolumeId', 'namespace': 'AWS/EBS', 'metric':'VolumeWriteBytes', 'statistics': ['Average', 'Maximum', 'Minimum']},
               {'idName': 'VolumeId', 'namespace': 'AWS/EBS', 'metric':'VolumeReadOps', 'statistics': ['Average', 'Maximum', 'Minimum']},
               {'idName': 'VolumeId', 'namespace': 'AWS/EBS', 'metric':'VolumeReadBytes', 'statistics': ['Average', 'Maximum', 'Minimum']},
               {'idName': 'InstanceId', 'namespace': 'AWS/EC2', 'metric':'NetworkIn', 'statistics': ['Average', 'Maximum', 'Minimum']},
               {'idName': 'InstanceId', 'namespace': 'AWS/EC2', 'metric':'NetworkOut', 'statistics': ['Average', 'Maximum', 'Minimum']},
               {'idName': 'InstanceId', 'namespace': 'AWS/EC2', 'metric':'NetworkPacketsIn', 'statistics': ['Average', 'Maximum', 'Minimum']},
               {'idName': 'InstanceId', 'namespace': 'AWS/EC2', 'metric':'NetworkPacketsOut', 'statistics': ['Average', 'Maximum', 'Minimum']}
             ];


// ==== get current timestamp in Taiwan timezone
function getCurTs(){
    var curr_timestamp = new Date();
    return curr_timestamp.toISOString();
}


// ==== request for all instance's id which are filtered
function getInstanceId(args, callback){
    aws.command('ec2 describe-instances --region '+args.region+' --filters '+args.filters).
        then(function (data) {
            var reserv = data.object.Reservations;
            var insts, tags;
            var reserv_idx, inst_idx, tag_idx;
            var result = [];

            var refactored_inst;
            // the received data contains 4 object because of 4 security group
            // each group havs their own instances
            for (reserv_idx = 0; reserv_idx < reserv.length; reserv_idx++){
                insts = reserv[reserv_idx].Instances;
                for(inst_idx = 0; inst_idx < insts.length; inst_idx++){
                    refactored_inst = {};
                    refactored_inst.InstanceId = insts[inst_idx].InstanceId;
                    refactored_inst.VolumeId = insts[inst_idx].BlockDeviceMappings[0].Ebs.VolumeId;
                 
                    tags = insts[inst_idx].Tags;
                    refactored_inst.tags = {};
                    for(tag_idx = 0; tag_idx < tags.length; tag_idx++)
                    {
                        refactored_inst.tags[tags[tag_idx].Key] = tags[tag_idx].Value;
                    }
                    result.push(refactored_inst);
                }
            }
            callback(null, result);
    });
}


// ==== request for metrics of instances
function getMetrics(target_arr, callback){
    var currTs = new Date();
    var startTs = new Date();
    
    // sub 18 minutes
    startTs.setMinutes(startTs.getMinutes()-18);
    currTs = currTs.toISOString();
    startTs = startTs.toISOString();
    var result = [];
    var aws_q = async.queue(function (task, callback) {
        aws.command('cloudwatch get-metric-statistics --metric-name '+task.metric+' --start-time '+startTs+' --end-time '+currTs+' --period 300 --region '+region+' --namespace '+task.namespace+' --statistics '+task.statistic+' --dimensions Name='+task.idName+',Value='+task.target[task.idName]).then(
                function(data){
                    var tmp;
                    var j;
                    for(j=0; j<data.object.Datapoints.length; j++){
                        tmp = {};  
                        tmp['target'] = task.target;
                        tmp['metric'] = {};
                        tmp['metric']["Timestamp"] = data.object.Datapoints[j]["Timestamp"];
                        tmp['metric']["Unit"] = data.object.Datapoints[j]["Unit"];
                        tmp['metric']["Type"] = task.metric;
                        tmp['metric']["Statistic"] = task.statistic;
                        tmp['metric']["Value"] = data.object.Datapoints[j][task.statistic];
                        result.push(tmp);
                    }
                    callback()
                });
    }, 5);

    async.each(target_arr, 
            function(target){
                var i, j;
                for(i = 0; i<metrics.length; i++){
                    for(j = 0; j<metrics[i].statistics.length; j++){
                        aws_q.push({
                            idName: metrics[i].idName,
                            target: target, 
                            metric: metrics[i].metric,
                            statistic: metrics[i].statistics[j], 
                            namespace: metrics[i].namespace}, 
                        function(){/*console.log("finish "+instanceId);*/});
                    }
                }
            }, 
            function(err){console.log(err);})

    aws_q.drain = function() {
           console.log(JSON.stringify(result, null, 2))
    }
}



var main = async.seq(getInstanceId, getMetrics);

main({"region":region, "filters": filters}, function(){});
