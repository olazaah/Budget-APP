// BUDGET CONTROLLER CLASS
var budgetController = (
    function(){

        // An expenses contructor to store the expenses
        var Expense = function(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        // An expenses prototype of the prototype class to calculate expenses percentage based on the total income
        Expense.prototype.calcPercentage = function(totalInc){
            if (totalInc > 0){
                this.percentage = Math.round((this.value / totalInc) * 100);
            } else{
                this.percentage = -1;
            }
            
        }

        // An expenses prototype function that returns the percentage from the calcPercentage prototype function from the expense constructor
        Expense.prototype.getPercentage = function(){
            return this.percentage;
        }

        // An income class constructor to store income details
        var Income = function(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value;
        }

        // the budget controller class constructor data structure, it stores the expenses and income of all items as well as the total expenses and income and the budget and percentage
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

        // Function calculates the total expenses or income and stores it in the totals dictionary in the data structure
        function calulateTotal(type){
            var sum = 0;

            data.allItems[type].forEach(function(current){
                sum += current.value;
            })
            
            data.total[type] = sum;
        }
        
        // The following set of functions are accessible to outside classes
        return{
            // This function adds new entry to the data structure, either expenses or income
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

            // This function deletes from the data structure either the expenses or income
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

            // This function calculates the budget from the total income and expenses
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

            // This function calculates the percentages for each expenses incurred with respect to thr total available income
            calculatePercentages: function(){
                data.allItems.exp.forEach(function(current){
                    current.calcPercentage(data.total.inc);
                })
            },

            // This function returns the budget, total income, total expenses and it's percentage
            getBudget: function(){
                // console.log(data.budget, data.total.inc, data.allItems.inc);
                return{
                    budget: data.budget,
                    totalInc: data.total.inc,
                    totalExp: data.total.exp,
                    percentage: data.percentage
                };
            },

            // This function returns each percentage of incurred expenses
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

// UI CONTROLLER CLASS
var UIController = (function() {
    
    // Dictionary with a list of HTML classes from the HTML document
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

    // Function that formats number input that would be displayed in the UI
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
        // Automating the process of add comma to the thousands, millions and heigher numbers
        for (var i = 3; i < int.length; i+=4){
            int = int.substr(0, int.length - i) + ',' + int.substr(int.length - i, i);
        }
        // if (int.length > 3){
        //     int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        // }
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    // Creating a foreach function for a node list as it is not a JavaScript array
    function nodeListForEach(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    }

    // The following set of functions ar accessible to outside functions
    return{
        // This function gets user input from the forms on the HTML page
        getInput: function(){
            return{
                type:document.querySelector(DOMStrings.inputType).value, // Will be either "inc" or "exp
                description:document.querySelector(DOMStrings.inputDecription).value, 
                value:parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
            
        },

        // Function to get the stored domstrings dictionary
        getDOMStrings: function(){
            return DOMStrings;
        }, 

        // This function adds items to either the income div or expenses div with a bunch of html codes inserted into the DOM
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

        // The function removes from the DOM list elements
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        // This function clears the input fields 
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

        // This funtion displays the budget in the UI
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
        // This function displays the percentages in UI
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

        // This function displays the current month and year
        displayMonth: function(){
            var now, months, month, year;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            console.log(now);
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        // This function changes the state of the DOM based on if it were income of expenses
        changedType: function(){
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDecription + ',' + DOMStrings.inputValue);
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            })
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    }

})();


// GLOBAL APP CONTROLLER CLASS
var Controller = (function(budgetCtrl, UICtrl){
    // This function listens to events activities in the APP
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

    // This function calls the calculate budget function and get budget function based on the required type and also updates the UI 
    function updateBudget(type){
        //  1. Calculate the budget
        budgetCtrl.calculateBudget(type);
        //  2. Return the budget
        var budget = budgetCtrl.getBudget();
        //  3. Display the budget UI
        UICtrl.displayBudget(budget);
    }

    // Thid function calls functions from the budget class and updates the result to the UI
    function updatePercentages(){
        //  1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        //  2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //  3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages); 
    }

    // This function gets input and add to it's determined data structure and updates the UI
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

    // This function deletes list item from the both the UI and the data structure and updates the budget and percentages
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

    // The functions in this return are accessible by outside functions
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

// Calling the init function in the controller class to initiale the budget APP
Controller.init();