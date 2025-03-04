import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';


class Booking {
    constructor(element){
        const thisBooking=this;
        thisBooking.render(element);
        thisBooking.initWidgets();
    }
    render(element){
        const thisBooking=this;
        //console.log(element);

        const generatedHTML=templates.bookingWidget();

        thisBooking.dom={};

        thisBooking.dom.wrapper=element;

        thisBooking.dom.wrapper.innerHTML=generatedHTML;

        thisBooking.dom.peopleAmount=thisBooking.dom.wrapper.querySelector(select.widgets.booking.peopleAmount);
        //console.log(thisBooking.dom.peopleAmount)

        thisBooking.dom.hoursAmount=thisBooking.dom.wrapper.querySelector(select.widgets.booking.hoursAmount);

        thisBooking.dom.datePicker=thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        //console.log(thisBooking.dom.datePicker);

        thisBooking.dom.hourPicker=thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        //console.log(thisBooking.dom.hourPicker)

    }
    initWidgets(){
        const thisBooking=this;

        thisBooking.peopleAmount=new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount=new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.peopleAmount.addEventListener('click', function(){});

        thisBooking.dom.hoursAmount.addEventListener('click', function(){});

       thisBooking.datePicker=new DatePicker(thisBooking.dom.datePicker);

       thisBooking.hourPicker=new HourPicker(thisBooking.dom.hourPicker);
    }
}

export default Booking;