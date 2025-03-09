import {select,settings, templates, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';


class Booking {
    constructor(element){
        const thisBooking=this;

        thisBooking.selectedTable=null;

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
    }
    getData(){
        const thisBooking=this;

        const startDateParam=settings.db.dateStartParamKey+'='+utils.dateToStr(thisBooking.datePicker.minDate);

        const endDateParam=settings.db.dateEndParamKey+"="+utils.dateToStr(thisBooking.datePicker.maxDate);

        const params ={
            bookings:[
                startDateParam,
                endDateParam,
            ],
            eventsCurrent:[
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat:[
                settings.db.repeatParam,
                endDateParam,
            ]
        }
        const urls={
            //adres endpointu, ktory zwroci liste rezerwacji
            bookings:settings.db.url+'/'+settings.db.bookings+'?'+ params.bookings.join('&'),
            //zwraca liste wydarzen jednorazowych
            eventsCurrent:settings.db.url+'/'+settings.db.events+'?'+params.eventsCurrent.join('&'),
            //lista wydarzen cyklicznych
            eventsRepeat:settings.db.url+'/'+settings.db.events+'?'+params.eventsRepeat.join('&')
        };
        //console.log(urls);

        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])

            .then(function(allResponse){
                const bookingsResponse=allResponse[0]
                const eventsCurrentResponse=allResponse[1]
                const eventsRepeatResponse=allResponse[2]
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(function([bookings,eventsCurrentResponse,eventsRepeatResponse]){
                //console.log(bookings,eventsCurrentResponse,eventsRepeatResponse)
                thisBooking.parseData(bookings,eventsCurrentResponse,eventsRepeatResponse)
            })
    }

    parseData(bookings,eventsCurrent,eventsRepeat){
        const thisBooking=this;

        //empy object -information about booked tables
        thisBooking.booked={};


        for( let item of bookings){
            thisBooking.makebooked(item.date, item.hour, item.duration, item.table);
        }

        for( let item of eventsCurrent){
            thisBooking.makebooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate=thisBooking.datePicker.minDate;
        const maxDate=thisBooking.datePicker.maxDate;

        for( let item of eventsRepeat){
            if(item.repeat=='daily'){
                for(let loopDate=minDate; loopDate<=maxDate;loopDate= utils.addDays(loopDate,1)){
                    thisBooking.makebooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }
        //console.log(thisBooking.booked)
        thisBooking.updateDOM();
    }

    makebooked(date, hour, duration,table){
        const thisBooking=this;
        //console.log(date);

        if(typeof thisBooking.booked[date]=='undefined'){
            thisBooking.booked[date]={};
        }
        const startHour=utils.hourToNumber(hour);
        //console.log(startHour);

        for(let hourBlock=startHour; hourBlock< startHour+duration; hourBlock+=0.5){
            if(typeof thisBooking.booked[date][hourBlock]=='undefined'){
                thisBooking.booked[date][hourBlock]=[];
            }
            thisBooking.booked[date][hourBlock].push(table);
        }
        //console.log(thisBooking.booked)
    }

    updateDOM(){
        const thisBooking=this;

        thisBooking.date=thisBooking.datePicker.value;
        thisBooking.hour=utils.hourToNumber(thisBooking.hourPicker.value);
        //console.log(thisBooking.hour);

        let allAvailable=false;

        if(typeof thisBooking.booked[thisBooking.date]=='undefined'|| typeof thisBooking.booked[thisBooking.date][thisBooking.hour]=='undefined'){allAvailable=true}

        for(let table of thisBooking.dom.tables){
            let tableId=table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId=parseInt(tableId)
            }
            if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked)
            }

            thisBooking.resetSelectedTable();
        }
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

        thisBooking.dom.tables=thisBooking.dom.wrapper.querySelectorAll(select.widgets.booking.tables);

        thisBooking.dom.tableWrapper=thisBooking.dom.wrapper.querySelector(select.widgets.booking.tablesWrapper);
        //console.log(thisBooking.dom.tableWrapper);

        thisBooking.dom.submitButton=thisBooking.dom.wrapper.querySelector(select.widgets.booking.submitButton);
        //console.log(thisBooking.dom.submitButton);

        thisBooking.dom.phone=thisBooking.dom.wrapper.querySelector(select.widgets.booking.phone);
        //console.log(thisBooking.dom.phone)

        thisBooking.dom.address=thisBooking.dom.wrapper.querySelector(select.widgets.booking.address);

        thisBooking.dom.starters=thisBooking.dom.wrapper.querySelectorAll(select.widgets.booking.starters);
        //console.log(thisBooking.dom.starters);

    }
    initWidgets(){
        const thisBooking=this;

        thisBooking.peopleAmount=new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount=new AmountWidget(thisBooking.dom.hoursAmount);

        //console.log(thisBooking.peopleAmount);

        thisBooking.dom.peopleAmount.addEventListener('click', function(){});

        thisBooking.dom.hoursAmount.addEventListener('click', function(){});

       thisBooking.datePicker=new DatePicker(thisBooking.dom.datePicker);

       thisBooking.hourPicker=new HourPicker(thisBooking.dom.hourPicker);

       thisBooking.dom.wrapper.addEventListener('updated', function(){
        thisBooking.updateDOM();
       })

       thisBooking.dom.tableWrapper.addEventListener('click', function(event){
        thisBooking.initTables(event);
       })

       thisBooking.dom.submitButton.addEventListener('click', function(event){
        event.preventDefault();
        thisBooking.sendBooking();
       })
    }

    sendBooking(){
        const thisBooking=this;

         //localhost:3131/bookings
        const urlBooking=settings.db.url+'/'+settings.db.bookings;
        //console.log(urlBooking);

        console.log(thisBooking.dom.phone.value);
        console.log(thisBooking.dom.address.value);

        const payload=
        {
            "date":thisBooking.date,
            "hour": utils.numberToHour(thisBooking.hour),
            "table":parseInt(thisBooking.selectedTable) || null,
            "duration":thisBooking.hoursAmount.value,
            "ppl":thisBooking.peopleAmount.value,
            "starters":[],
            "phone":thisBooking.dom.phone.value,
            "address": thisBooking.dom.address.value
        };

        for (let checkbox of thisBooking.dom.starters){
            if(checkbox.checked){
                payload.starters.push(checkbox.value);
            }
        }

        const option={
            method:'POST',
            headers:{
                'Content-Type':'application/json',
            },
            body:JSON.stringify(payload)
        };

        fetch(urlBooking, option)
            .then(function(response){
                return response.json();
            }).then (function(parsedResponse){
                console.log(parsedResponse)

                thisBooking.makebooked(payload.date, payload.hour, payload.duration, payload.table);
                thisBooking.updateDOM();
            })

        thisBooking.resetForm();

    }


    initTables(event){
        const thisBooking=this;

        const clickedElement=event.target;
        //console.log(clickedElement);

       if (clickedElement.classList.contains('table')){
        const tableId=clickedElement.getAttribute(settings.booking.tableIdAttribute);

        if(clickedElement.classList.contains(classNames.booking.tableBooked)){
            alert('This table is not available');
            return
        }

        if(thisBooking.selectedTable===tableId){
            clickedElement.classList.remove(classNames.booking.tableSelected);
            thisBooking.selectedTable=null;
        } else {
            for (let table of thisBooking.dom.tables){
                table.classList.remove(classNames.booking.tableSelected);
            }
            clickedElement.classList.add(classNames.booking.tableSelected);
            thisBooking.selectedTable=tableId;
        }
       }
    }

    resetSelectedTable(){
        const thisBooking=this;

        for(let table of thisBooking.dom.tables){
            table.classList.remove(classNames.booking.tableSelected)
        }
        thisBooking.selectedTable=null;

    }

    resetForm(){
        const thisBooking=this;
        //console.log('ok')

        thisBooking.dom.phone.value='';
        thisBooking.dom.address.value='';

        thisBooking.peopleAmount.value=1;
        thisBooking.hoursAmount.value=1;

        for(let checkbox of thisBooking.dom.starters){
            checkbox.checked=false;
        }

        thisBooking.resetSelectedTable();

    }
}

export default Booking;