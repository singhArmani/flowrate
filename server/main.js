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
        console.log(d);

        //Check if there's any document in FlowSamples collection which is one month old
        var FlowArray = FlowSamples.find({DateofInsert:{$lte:new Date(d.getTime()- 2*60*1000)}}).fetch(); //1 month ago
        console.log(FlowArray);


        var TotalFlow = 0;

        //if there's any document one month older than the date d
        if(FlowArray.length>0) {
            var maxDate = 0;
            for(i=1;i<FlowArray.length; i++){
               var a =  FlowArray[i].DateofInsert.getTime() - FlowArray[i-1].DateofInsert.getTime();
                TotalFlow += FlowArray[i].FlowRate * a / 1000;
                if(FlowArray[i].DateofInsert.getTime() > maxDate) maxDate = FlowArray[i].DateofInsert.getTime();
            }

            console.log("total flow in last minute is "+TotalFlow);

            //Inserting
            FlowSamplesMinutely.insert({
                Flow: TotalFlow+'L',
                DateofInsert:new Date(d.getTime()- 2*60*1000)
            });

            //Removing the old documents from the FlowSamples collection which are already saved
            FlowSamples.remove({DateofInsert:{$lte:new Date(d.getTime()- 2*60*1000)}});
        }

    },60000);
}










