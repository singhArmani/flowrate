import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    FlowSamples.remove({}); //clearing the old data
    FlowSamplesMinutely.remove({});
    
  startLoggingFlowRatePerHalfSecond(flowRate,FlowSamples);  //per half second

    startLoggingFlowPerMinute();
});


var flowRate = () => {
    return Math.floor(Math.random()*20 + 10);  //dummy flow rate
}

var startLoggingFlowRatePerHalfSecond= (flowRate,Collection) =>{

    Meteor.setInterval(() => {
        //insert into the FlowSamples Collection
        // console.log("I am inserting "+flowRate()+" into the flow samples collection at "+ new Date() +" seconds!!");
        Collection.insert({
            FlowRate: flowRate(),
            DateofInsert: new Date()
        });

    },500 )
};


//Minutely Storing Flow into the FlowSamplesMinutely collection
var startLoggingFlowPerMinute = () => {
    Meteor.setInterval(() =>{

       //loop through the FlowSamples Collection
        var d = new Date();
        console.log(d)
        var FlowArray = FlowSamples.find({DateofInsert:{$lte:new Date(d.getTime()- 2*60*1000)}}).fetch(); //2 min earlier
        console.log(FlowArray);

        //or we can loop through FlowSamples and look for entries less than an hour

        var TotalFlow = 0;
        if(FlowArray.length>0) {

            for(i=1;i<FlowArray.length; i++){
               var a =  FlowArray[i].DateofInsert.getTime() - FlowArray[i-1].DateofInsert.getTime();
                TotalFlow += FlowArray[i].FlowRate * a / 1000;
            }

            console.log("total flow in last minute is "+TotalFlow);

            //Inserting
            FlowSamplesMinutely.insert({
                Flow: TotalFlow+'L',
                DateofInsert:new Date()
            });

            //Removing the old documents from the FlowSamples collection which are already saved
            FlowSamples.remove({DateofInsert:{$lte:new Date(d.getTime()- 2*60*1000)}});
        }

    },10000);
}








