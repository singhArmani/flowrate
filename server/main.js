import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    FlowSamples.remove({}); //clearing the old data
    FlowSamplesMinutely.remove({});
    
  startLoggingFlowRatePerHalfSecond(flowRate,FlowSamples);  //per half second

    startLoggingFlowPerMinute();
    //startLoggingFlowPerHour();
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
        
        //Check if there's any document in FlowSamples collection which is 2 minute old and runs in interval of 30 seconds
        var FlowArray = FlowSamples.find({DateofInsert:{$lte:new Date(d.getTime()- 1*60*1000)}}).fetch(); //1 minute ago
        console.log(FlowArray);


        var TotalFlow = 0;

        //if there's any document one month older than the date d
        if(FlowArray.length>0) {
            
            var minDate = 0, maxDate = 0;
            
            for(i=1;i<FlowArray.length; i++){
                
                minDate = FlowArray[0].DateofInsert.getTime(); //let assume the first element is the minimum date
                
                var a =  FlowArray[i].DateofInsert.getTime() - FlowArray[i-1].DateofInsert.getTime();
                TotalFlow += FlowArray[i].FlowRate * a / 1000;
                
                if(FlowArray[i].DateofInsert.getTime() < minDate) minDate = FlowArray[i].DateofInsert.getTime(); //getting the minDate of Insert
                
                if(FlowArray[i].DateofInsert.getTime() > maxDate) maxDate = FlowArray[i].DateofInsert.getTime(); //getting the maxDate of Insert
            }
            
            //Debugging Purpose
            console.log("min date is "+new Date(minDate));
            console.log("max date is "+new Date(maxDate));
            console.log("the flow was in timeinterval of "+(maxDate-minDate)/1000 +"seconds");

            //Inserting
            FlowSamplesMinutely.insert({
                Flow: TotalFlow+'L',
                DateofInsert:new Date(d.getTime()- 1*60*1000)
            });

            //Removing the old documents from the FlowSamples collection which are already saved
            FlowSamples.remove({DateofInsert:{$lte:new Date(d.getTime()- 1*60*1000)}});
        }

    },20000);
}


var startLoggingFlowPerHour = () =>{
    Meteor.setInterval(() =>{
        var d = new Date();

        //Check if there's any document in FlowSamplesMinutely collection which is one month old
        var FlowArray = FlowSamplesMinutely.find({DateofInsert:{$lte:new Date(d.getTime()- 4*60*1000)}}).fetch();  //4 minute ago for testing purpose

        var TotalFlow = 0;

        //if there's any document one month older than the date d
        if(FlowArray.length>0) {
            var minDate = 0;
            for(i=1;i<FlowArray.length; i++){
                var a =  FlowArray[i].DateofInsert.getTime() - FlowArray[i-1].DateofInsert.getTime();
                TotalFlow += FlowArray[i].FlowRate * a / 1000;
                if(FlowArray[i].DateofInsert.getTime() > minDate) minDate = FlowArray[i].DateofInsert.getTime();
            }

            console.log("total flow in last minute is "+TotalFlow);

            //Inserting
            FlowSamplesHourly.insert({
                Flow: TotalFlow+'L',
                DateofInsert:new Date(d.getTime()- 4*60*1000)
            });

            //Removing the old documents from the FlowSamplesMinutely collection 
            FlowSamplesMinutely.remove({DateofInsert:{$lte:new Date(d.getTime()- 4*60*1000)}});
        }

    },60000);
}









