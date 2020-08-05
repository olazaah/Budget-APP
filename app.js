// BUDGET CONTROLLER
var budgetController = (
    function(){
        var Expense = function(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        Expense.prototype.calcPercentage = function(totalInc){
            if (totalInc > 0){
                this.percentage = Math.round((this.value / totalInc) * 100);
            } else{
                this.percentage = -1;
            }
            
        }

        Expense.prototype.getPercentage = function(){
            return this.percentage;
        }

        var Income = function(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
        }

        var data = {
            allItems: {
                exp: [],
                inc: []
            },
            total: {
                exp:0,
                inc:0
            },
            budget: 0,
            percentage: -1
        }

        function calulateTotal(type){
            var sum = 0;

            data.allItems[type].forEach(function(current){
                sum += current.value;
            })
            
            data.total[type] = sum;
        }
        
        return{
            addItem: function(type, des, val){
                var newItem, ID;
                // Create a new ID if array is not empty
                if (data.allItems[type].length > 0){
                    ID = data.allItems[type][data.allItems[type].length -1].id + 1;
                }else {
                    ID = 0;
                }

                // Creat a new item based on 'inc' or 'exp' type
                if (type === 'exp'){
                    newItem = new Expense(ID, des, val);
                } else{
                    newItem = new Income(ID, des, val); 
                }

                // Push it into the data structure
                data.allItems[type].push(newItem);

                // Return the new element
                return newItem;
            },
            deleteItem : function(type, id){
                var ids, index;
                ids = data.allItems[type].map(function(current){
                    return current.id;
                });
                index = ids.indexOf(id);

                if (index !== -1){
                    data.allItems[type].splice(index, 1);
                }
            },
            calculateBudget: function(type){
                //  Calculate the total income and expenses
                calulateTotal(type);
                // calulateTotal('exp');

                //  Calculate the budget: Income - Expenses
                data.budget = data.total.inc - data.total.exp;

                //  Calculate the percentage income 
                if (data.total.inc > 0){
                    data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
                } else{
                    data.percentage = -1;
                }
                
            },
            calculatePercentages: function(){
                data.allItems.exp.forEach(function(current){
                    current.calcPercentage(data.total.inc);
                })
            },
            getBudget: function(){
                // console.log(data.budget, data.total.inc, data.allItems.inc);
                return{
                    budget: data.budget,
                    totalInc: data.total.inc,
                    totalExp: data.total.exp,
                    percentage: data.percentage
                };
            },
            getPercentages: function(){
                var allPerc = data.allItems.exp.map(function(current){
                    return current.getPercentage();
                })
                return allPerc;
            },
            testing : function(){
                console.log(data);
            }
        }
    }
)();

// UI CONTROLLER 
var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDecription: '.add__description',
        inputValue: '.add__value', 
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    var formatNumber = function(num, type){
        /*
        + or - before number
        exactly 2 decimal points
        comma separating the thousands
        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
        */
        var numsplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numsplit = num.split('.');
        int = numsplit[0];
        dec = numsplit[1];

        if (int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    function nodeListForEach(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    }

    // Some code
    return{
        getInput: function(){
            return{
                type:document.querySelector(DOMStrings.inputType).value, // Will be either "inc" or "exp
                description:document.querySelector(DOMStrings.inputDecription).value, 
                value:parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
            
        },

        getDOMStrings: function(){
            return DOMStrings;
        }, 

        addListItem: function(obj, type){
            var html, newHtml, test_element;
            // Create HTML sting with placeholder text

            if (type === 'inc'){
                test_element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp'){
                test_element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(test_element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDecription + ',' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = '';
            })
            fieldsArr[0].focus();
            /*

            A CLEANER AND SHORTER WAY TO CLEAR FIELDS BELOW

            var d1, d2;
            d1 = document.querySelector(DOMStrings.inputDecription);
            d2 = document.querySelector(DOMStrings.inputValue)
            d1.value='';
            d2.value='';
            d1.focus()

            */
        },
        displayBudget: function(obj){
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentage){
            var fields = document.querySelectorAll(DOMStrings.expensesPercentLabel);

            nodeListForEach(fields, function(current, index){
                if (percentage[index] > 0){
                    current.textContent = percentage[index] + '%';
                } else{
                    current.textContent = '---';
                }
            })
        },
        displayMonth: function(){
            var now, months, month, year;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            console.log(now);
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function(){
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDecription + ',' + DOMStrings.inputValue);
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            })
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    }

})();


// GLOBAL APP CONTROLLER
var Controller = (function(budgetCtrl, UICtrl){
    function setupEventListerners(){
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    }
    function updateBudget(type){
        //  1. Calculate the budget
        budgetCtrl.calculateBudget(type);
        //  2. Return the budget
        var budget = budgetCtrl.getBudget();
        //  3. Display the budget UI
        UICtrl.displayBudget(budget);
    }
    function updatePercentages(){
        //  1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        //  2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //  3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages); 
    }
    function ctrlAddItem(){
        var input, newItem;
        //  1. Get the field input data 
        input = UICtrl.getInput();
        //  2. Add the item to the budget controller 
        if (input.description !== '' && !isNaN(input.value) && input.value > 0){
            newItem = budgetController.addItem(input.type, input.description, input.value);
            //  3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //  4. Clear the fields
            UICtrl.clearFields();
            //  5. Calculate and update budget
            updateBudget(input.type);
            //  6. Calculate and update percentages
            updatePercentages();
        }
    }
    function ctrlDeleteItem(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //  1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            //  2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //  3. Update and show the new budegt
            updateBudget(type);
            //  4. Calculate and update percentages
            updatePercentages();

        }
    }

    return{
        init: function(){
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListerners();
        }
    }
    
})(budgetController, UIController);

Controller.init();