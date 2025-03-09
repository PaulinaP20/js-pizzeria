import {templates, select} from '../settings.js';

class Home {
    constructor(element){
        const thisHome=this;
        thisHome.element=element;
        thisHome.render();
        thisHome.getElements();
        thisHome.initActions();
    }

    getElements(){
        const thisHome=this;

        thisHome.dom.forwardToOrder=thisHome.dom.wrapper.querySelector(select.widgets.home.forwardToOrder);

        thisHome.dom.forwardToBooking=thisHome.dom.wrapper.querySelector(select.widgets.home.forwardToBooking);
    }


    render(){
        const thisHome=this;

        thisHome.dom={};

        thisHome.dom.wrapper=thisHome.element;

        const generatedHTML=templates.homeWidget();

        thisHome.dom.wrapper.innerHTML=generatedHTML;
    }

    initActions() {
        const thisHome=this;

        thisHome.dom.forwardToOrder.addEventListener('click', function(event){
            event.preventDefault();
            window.location.hash='#/order';
        })

        thisHome.dom.forwardToBooking.addEventListener('click', function(event){
            event.preventDefault();
            window.location.hash='#/booking';
        })
    }
}

export default Home;