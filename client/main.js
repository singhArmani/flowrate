import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';


Template.FlowRate.helpers({
    getFlowRate: () =>{
        var d = new Date(); //current millisecond since 1970 jan
        return  FlowSamples.find({DateofInsert:{$gte:new Date(d.getTime()- 500)}}).fetch();
    }
});