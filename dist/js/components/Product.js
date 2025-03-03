import {select,classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';


class Product {
    constructor(id, data){
      const thisProduct=this;

      thisProduct.id=id;
      thisProduct.data=data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

    }

    renderInMenu(){
      const thisProduct=this;

      //generate html based on template

      const generatedHTML=templates.menuProduct(thisProduct.data);

      //create element using utils.createElementFromHTML

      thisProduct.element=utils.createDOMFromHTML(generatedHTML);

      //find menu container
      const menuContainer=document.querySelector(select.containerOf.menu);

      //add element to menu
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom={};

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
      thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log(thisProduct.dom.priceElem)
      thisProduct.dom.imageWrapper=thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem=thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAmountWidget(){
      const thisProduct=this;

      thisProduct.amountWidget=new AmountWidget(thisProduct.dom.amountWidgetElem);
      //console.log(thisProduct.dom.amountWidgetElem);

      thisProduct.dom.amountWidgetElem.addEventListener('updated',function(){
        thisProduct.processOrder();
      });
    }

    initAccordion(){
      const thisProduct=this;

      /* START: add event listener to clickable trigger on event click */
      if (thisProduct.dom.accordionTrigger){
        thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
          /* prevent default action for event */
          event.preventDefault();

          /* find active product (product that has active class) */
          const activeProduct=document.querySelector(select.all.menuProductsActive);
          /* if there is active product and it's not thisProduct.element, remove class active from it */
          if(activeProduct && activeProduct!==thisProduct.element){
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }
          /* toggle active class on thisProduct.element */
          thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        });
      }
    }

    initOrderForm(){
      const thisProduct=this;

      thisProduct.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        })
      }

      thisProduct.dom.cartButton.addEventListener('click', function(event){
        event.preventDefault()
        thisProduct.processOrder();
        thisProduct.addToCart()
      })
    }

    processOrder(){
      const thisProduct=this;

      const formData=utils.serializeFormToObject(thisProduct.dom.form);
      //console.log(thisProduct.form);
      //console.log('formData: ', formData);

      let price=thisProduct.data.price;

      for ( let paramId in thisProduct.data.params){
        const param=thisProduct.data.params[paramId];
        //console.log(paramId);
        //console.log(param);

        for (let optionId in param.options){
          const option=param.options[optionId];
          //console.log(optionId);
          //console.log(option);

          const optionSelected=formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected){
            if(!option.default){
              price=price+option.price
            }
          } else {
            if(option.default){
              price=price-option.price
            }
          }

          const optionImage=thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);

          if(optionImage){
            if(optionSelected){
              optionImage.classList.add(classNames.menuProduct.imageVisible)
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduct.priceSingle=price;

      price*=thisProduct.amountWidget.value;
      thisProduct.dom.priceElem.innerHTML=price;


    }

    addToCart(){
      const thisProduct=this;
      //app.cart.add(thisProduct.prepareCartProduct());
      const event = new CustomEvent('add-to-cart', {
        bubbles:true,
        detail: {
          product:thisProduct.prepareCartProduct()
        }
      });
      thisProduct.element.dispatchEvent(event);

    }

    prepareCartProduct(){
      const thisProduct=this;

      const productSummary={
        id:thisProduct.id,
        name:thisProduct.data.name,
        amount:thisProduct.amountWidget.value,
        singlePrice:thisProduct.priceSingle,
        price:thisProduct.priceSingle*thisProduct.amountWidget.value,
        params:(thisProduct.prepareCartProductParams()),
      }
      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct=this;

      const formData=utils.serializeFormToObject(thisProduct.dom.form);
      const params={};

      for ( let paramId in thisProduct.data.params){
        const param=thisProduct.data.params[paramId];

        params[paramId]={
          label:param.label,
          options:{}
        }

        for (let optionId in param.options){
          const option=param.options[optionId];
          const optionSelected=formData[paramId] && formData[paramId].includes(optionId);

          if(optionSelected){
            params[paramId].options[optionId]=option.label

          }
        }
      }

      return params;
    }
  }

  export default Product;