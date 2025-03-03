import {settings, select} from '../settings.js';

class AmountWidget {
    constructor (element) {
      const thisWidget=this;
      //console.log(thisWidget);
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);

      thisWidget.initActions();

    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      //console.log(element);

      thisWidget.dom={};

      thisWidget.dom.input = thisWidget.element.querySelector(select.widgets.amount.input);
      //console.log(thisWidget.dom.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      //console.log(thisWidget.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget=this;

      const newValue=parseInt(value);
      //console.log(value)

     if(thisWidget.dom.input){
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue>= settings.amountWidget.defaultMin && newValue<=settings.amountWidget.defaultMax){
        thisWidget.value=newValue;
        thisWidget.dom.input.value=newValue;

        thisWidget.announce();
      } else {
        thisWidget.dom.input.value=thisWidget.value;
      }
     }

      //console.log(thisWidget.value)
    }

    initActions(){
      const thisWidget=this;

      thisWidget.dom.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.dom.input.value)
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1)
      })
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);
      })
    }

    announce(){
      const thisWidget=this;

      const event=new CustomEvent('updated', {
        bubbles:true
      });
      thisWidget.element.dispatchEvent(event);
    }

  }

  export default AmountWidget;