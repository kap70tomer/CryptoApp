//JQuary raedy func.
$(() => {
    //Global Vars. 
    let selectedArr = [];
    let graphCurrenciesArr = [];
    let removeCurrencyArr = [];
    let currenciesLegendList = '';
    let globalDataModel = '';
    let sixChosen = [];
    //On LOAD determination of display all currencies function if you store it or get via AJAX.
    $(".container.currencies").ready(async() => 
    {//Main container "ready">triggers the flow.
        loader(".container.currencies");//Important!!! Clients "smooth feeling". Visual care.
        await currenciesFactory(globalDataModel);//Delays the Display func to after loader effect.
        if (globalDataModel === '') 
        {//(if null), Get from API.
            $.getJSON((`https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD`), Response => 
            {//Success method..
                globalDataModel = Response;
                $(".container.currencies").empty();
                currenciesFactory(Response);
            })
            .fail(() => 
            {//Sequnce in case the response was Negative(not 2XX)..
              $(".container.currencies").html("Something went wrong..., try again later")
              $(".container.currencies").css("color", "red");
                console.log("no Connection, failed to retriev...")
                alert(`Ooops, please try again later`);
            });
        }
        else 
        {//Load Cache (if found).
            $(".container.currencies").empty();
            currenciesFactory(globalDataModel);
        }
    });
    //Loads GIF, view (till promised arive).
    function loader(component)
    {
       const gif = '<img src="./assets/loader/load.gif"></img>';
       const loaderDiv = `<div class="loader" col-12">${gif}</div>`;
       $(loaderDiv).append(gif);      
       $(component).append(loaderDiv);
    };    
    //Takes given Array and builds it as Card to Display.
    function currenciesFactory(arrayData)
    {                
        $(arrayData).each((i, coin)=>
        {//every currency in Data set to his own html container.
            const h4 = `<h4 card-title>${coin.symbol.toUpperCase()}</h4>`;
            const p = `<p>${coin.name}</p>`;
            const input = `<input type="checkbox" id=switch>`
            const collapser = `<button id=${coin.id} class="btn btn-dark" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="collapseExample">Market Info</button>`;
            const collapserDiv = `<div class="${coin.id} collapse"></div>`;
            const newCoinDiv = `<div id="${coin.id}" class="card card-block col-12 col-md-3">${h4}${p}${input}${collapser}${collapserDiv}</div>`;
            
            $(".container.currencies").append(newCoinDiv);
        });
    };
    //Clear all selected currencies Button
    $("#uncheckAll").click(() => {
        $(`input`).prop("checked", false);
        $('.card').css("border-color", "lightgrey")
        selectedArr = [];
        graphCurrenciesArr = [];
        });
    //Search bar, works on the displayed list of currencies.
    $(".search").keyup(function () {
        let value = $(this).val().toLowerCase();
        $(".container.currencies>.card-block").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) >= 0);
        });//warn if not found.
        if (!$(".card-block").is(":visible")) {
            const error404 = `<p>"${value}" not found</p>`;
            $(".container.currencies>p").remove();
            $(".container.currencies").append(error404);
        }
        else {
            $(".container.currencies>p").remove();
        }
    });
    //Clear search bar and search reasults.
    $("#clearSearch").click(function () {
            $(".search").val('');
            $(".container.currencies").html(" ");
            currenciesFactory(globalDataModel);
            $(selectedArr).each((i, item)=> {
                $(`#${item} #switch`).prop("checked", true);
                $(`#${item} #switch`).parent().css("border-color", "blue");
            });
        });
    //Trigger to Open Collapser with Market info + Symbol image
    $(document).on("click", ".btn-dark", async function () 
    {
        if ($(`.${this.id}`).attr("class") == `${this.id} col-12 collapse show`)
        {
            $(`.${this.id}`).collapse("toggle");
            setTimeout(() => 
            {//collapser time out.
                $(`.${this.id}`).empty();
            }, 700);
        } 
        else
        {  
            $(`.${this.id}`).collapse("toggle"); 
            loader(`.${this.id}`);
            await displayInfoCollapser(this.id);
        };
    });
    //Display Marcket info of given Currency
    function displayInfoCollapser(currency) 
    {
        if (localStorage.getItem(currency) === null) 
        {//if Not Stored, Get from API (AJAX).
            $.getJSON((`https://api.coingecko.com/api/v3/coins/${currency}`),
            Response => {//Complete URL with desired Currency name.
                const img = `<img class="col-xs-1 img-fluid" src="${Response.image.small}">`;
                const pUSD = `<p>USD: ${Response.market_data.current_price.usd}&dollar;</p>`;
                const pEUR = `<p>EUR: ${Response.market_data.current_price.eur}&euro;</p>`;
                const pILS = `<p>ILS: ${Response.market_data.current_price.ils}&#8362;</p>`;
                const Div = `<div class="row">${img}<div class="col-xs-4">${pUSD}${pEUR}${pILS}</div></div>`;
                //Gather info from response, set into collapser area.
                $(`.${currency}`).empty();
                $(`.${currency}`).append(Div);
                
                localStorage.setItem(`${currency}`, 
                    JSON.stringify({image: img, usd: pUSD, eur: pEUR, ils: pILS})
                ); //Set infoData to LocalStorage.      
                setTimeout(() => 
                {//Set timer for info kept in storage.
                    localStorage.removeItem(currency);
                }, 120000);
            })
            .fail(() => 
            {//Unable to retrive intrest Data from API.
                alert(`Failed retrieving from server, please try again later`);
                $(`.${currency}`).collapse("toggle");
                setTimeout(() => 
                {//Collapse Toggles and timer 'close'.
                    $(`.${currency}`).empty();
                }, 700);
            });
        }
        else
        {//Data was already Stored complite, Get and Display from storage.
            const info = JSON.parse(localStorage.getItem(`${currency}`));
            const collapserData = `<div class="row">${info.image}<div class="col-xs-4">${info.usd}${info.eur}${info.ils}</div></div>`;
            $(`.${currency}`).empty();
            $(`.${currency}`).append(collapserData);
        }
    }//Select currency by 'Switch'
    $(document).on("click", ".card> #switch", function () 
    {//Main currencies page Switch triggers.
        if ((this).checked === true) 
        {//When Selected.
            $(this).parent().css("border-color", "blue");
            //Change card visual style. 
                selectedArr.push($(this).parent().get(0).id);
                //Get current id by element Parent id.
                graphCurrenciesArr.push($(this).parent().get(0).firstChild.innerText);
                //Get graphs proper data from UI.
        }
        else 
        {//UnSelect.
            $(selectedArr).each((index, value) => 
            {//check wich index to throw out of user selection.
                if (value === $(this).parent().get(0).id) 
                {//is ID switched off same as selected ? "splice||check next id".   
                    $(this).parent().css("border-color", "lightgrey");
                    //Initilaztion card style.
                    selectedArr.splice(index, 1);
                    graphCurrenciesArr.splice(index, 1);
                    //Throw away from both Arrays.
                };
            });
        };
        //Modal Trigger
        if (selectedArr.length >= 6) 
        {//When user chose Sixth time..
            $(this).prop("checked", false);
			$(this).parent().css("border-color", "lightgrey");
            //Card of six choice change, depends on users appliment in modal changing options.
            sixChosen = [selectedArr[5], graphCurrenciesArr[5]];
            selectedArr.splice(5, 1);
            graphCurrenciesArr.splice(5, 1);
            //keep the six aside and clear from selected and graph array.
            popModal();//Modal added to body, not view yet.
            $(`#changeChoiceModal`).modal();// modal to view.UI
            createModalBody();//load selected currencies to modal body.
        };
    });
         
    $(".btn.currencies").click(() => {
   //Main Page for Currencies info and selection.
        $(".container.currencies").css("display", "flex");
        $(".container.reports").css("display", "none");
        $(".container.about").css("display", "none");
        $(".searchBar").css("visibility", "initial");
        //Set right layout of "control panel" on UI.
        $(".btn.currencies").css("backgroundColor", "yellow");
        $(".btn.currencies").css("color", "#000");
        $(".btn.about").css("color", "#fff");
        $(".btn.about").css("backgroundColor", "#6c757d");
        $(".btn.reports").css("color", "#fff");
        $(".btn.reports").css("backgroundColor", "#6c757d");
    });

    $(".btn.reports").click(() => {
   //"LIVE" Reports page Shows Chart with selected Currencies.
        $(".container.currencies").css("display", "none");
        $(".container.reports").css("display", "flex");
        $(".container.about").css("display", "none");
       //Set proper layout of "control panel" on UI.
        $(".searchBar").css("visibility", "hidden");
        $(".btn.reports").css("backgroundColor", "yellow");
        $(".btn.reports").css("color", "#000");
        $(".btn.currencies").css("color", "#fff");
        $(".btn.currencies").css("backgroundColor", "#6c757d");
        $(".btn.about").css("color", "#fff");
        $(".btn.about").css("backgroundColor", "#6c757d");
        displayChartPage();
    });
    $(".btn.about").click(() => {
    //About me Page, Shows my profile .  
        $(".container.currencies").css("display", "none");
        $(".container.reports").css("display", "none");
        $(".container.about").css("display", "flex");
        //Set accurate layout of "control panel" on UI.
        $(".searchBar").css("visibility", "hidden");    
        $(".btn.about").css("backgroundColor", "yellow");
        $(".btn.about").css("color", "#000");
        $(".btn.reports").css("color", "#fff");
        $(".btn.reports").css("backgroundColor", "#6c757d");
        $(".btn.currencies").css("color", "#fff");
        $(".btn.currencies").css("backgroundColor", "#6c757d");
      
    });
     // Modal creation.
     function popModal() {
        const modal = `<div class="modal fade" id="changeChoiceModal" tabindex="-1" role="dialog" aria-labelledby="changeChoiceModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="changeChoiceModalLabel">Reached Maximum 5 Currencies</h5>
                    <p>Please Remove one Selected currency, To Add your sixth choice</p>
                </div>
                <div class="modal-body">
                </div>
                <div class="modal-footer justify-content-center">
                <p></p>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary">Apply</button>
                </div>
            </div>
        </div>
    </div>`;
        $("body").append(modal);
    }
    // Modal Content feed.
    function createModalBody() {
        //Modal body contain all selected currencies and switch for each.
        $(".modal-body").empty();
        $.each(selectedArr, function (index, value) 
        {
            const p = `<p>${value}</p>`;
            const input = `<input type="checkbox" class="${index}" id="switch" checked>`;
            const newDiv = `<div class="row" id="${value}">${input}${p}</div>`;
            $(".modal-body").append(newDiv);
            $(".modal-footer>p").html("Apply: "+ sixChosen);
            removeCurrencyArr = [];//Temporarly array for Modal period, inorder to cancel or save changes made in modal. 
        });
    };
    // Modal switch, pushes to removal Tmp array.
    $(document).on("click",".row>#switch", function () 
    {
        let index = +$(this).attr("class");
        removeCurrencyArr.push(index);
    });
    // Modal apply changes.
    $(document).on("click", ".modal-footer>.btn-primary", function ()
    {// Comparing modal Tmp data model to selected and graph models.
        $(`#changeChoiceModal`).modal('hide');
        $(`input`).prop("checked", false);
        $('.card').css("border-color", "lightgrey");
        // Initilazation of UI.
        if (removeCurrencyArr.length != 0) 
        {
            selectedArr.push(sixChosen[0]);
            graphCurrenciesArr.push(sixChosen[1]);
			sixChosen=[];
        }// Six Chosen to Sellection.
        $.each(removeCurrencyArr, function(i, index) 
        {
            selectedArr.splice(index, 1);
            graphCurrenciesArr.splice(index, 1);
        })// Clear modal uncheacked currencies from selection.
        $.each(selectedArr, function(i, item) 
        {// Use "updated model" to determine UI checked properties and style to right cards.
            $(`#${item} #switch`).prop("checked", true);
            $(`#${item} #switch`).parent().css("border-color", "blue");
        });
    }); 
    //Chart page UI.
    async function displayChartPage() 
    {//Put chart to view. 
        if (selectedArr.length == 0) 
        {//make sure client side is apropriate.
            const h2 = `<h2>Please select at least one currency</h2>`;
            $("#chartContainer").empty();
            $("#chartContainer").append(h2);
        }//warn if not.

        if (selectedArr.length !== 0) 
        {
            currenciesLegendList = '';
            if (selectedArr.length == 1) 
            {
                const tmp = selectedArr[0].toLowerCase().replace(/\b[a-z]/g, function (letter) 
                {
                    return letter.toUpperCase();
                });
                currenciesLegendList = `${tmp} Price`;
            }//edit data from selected model to fit in chart headers and axes.
            else {
                $.each(selectedArr, function (i, currency) 
                {//Give every currency a "Legendary-header" and "Representive Color".
                    const tmp = currency.toLowerCase().replace(/\b[a-z]/g, function (letter) {
                        return letter.toUpperCase();
                    });
                    (i < selectedArr.length - 1) ? currenciesLegendList += `${tmp}, ` : currenciesLegendList += `and ${tmp} `;
                });
                currenciesLegendList += `Prices`;
            }
            loader("#chartContainer");
            await displayChart();
        }
    }
    //display live chart DATA.
    async function displayChart() 
    {
        let xAxis = [];
        let dataSets = [];
        let s = -2;
        let m = 0;
        $("#chartContainer").empty();
        let canvas = `<canvas id="myChart"></canvas>`;
        $("#chartContainer").append(canvas);
        let ctx = $("#myChart");
        
        let config = 
        {
            data: 
            {
                labels: xAxis,
                datasets: currencyData()
            },
            options: 
            {
                showXLabels: 5,
                type: `linear`,
                resposive: true,
                maintainAspectRatio: false,
                hoverMode: `index`,
                title: 
                {
                    display: true,
                    text: currenciesLegendList,
                    fontColor: `white`
                },
                scales: 
                {
                    yAxes: 
                    [{
                        display: true,
                        gridLines: 
                        {
                            drawBorder: false,
                            color: `lightgrey`
                        },
                        ticks: 
                        {
                            fontColor: 'lightgreen'
                        },
                        scaleLabel: 
                        {
                            display: true,
                            labelString: `$$$`,
                            fontSize: `50`,
                            fontColor: `lightgreen`
                        }
                    }],
                    xAxes: 
                    [{
                        distribution: 'series',
                        scaleLabel: 
                        {
                            display: true,
                            fontSize: `50`
                        },
                        ticks:
                        {
                            fontColor: `whitesmoke`
                        },
                    }]
                },
                gridLines: 
                {
                    drawOnChartArea: false
                },
                legend: 
                {
                    display: true,
                    labels: 
                    {
                        fontColor: `white`,
                    }
                }
            }
        };
        // Creating Chart's Data
        function currencyData()
        {
            $.each(graphCurrenciesArr, (i, currencyData) => 
            {
                let rdmClr = `rgba(${rdmRGB()}, ${rdmRGB()}, ${rdmRGB()}, 1)`;
                let y = [];
                getY(currencyData, y, i);
                // Creating Chart's DataSets
                const dataSet = 
                {
                    label: currencyData,
                    fontColor: `black`,
                    fill: false,
                    data: y,
                    yAxisId: currencyData,
                    borderColor: rdmClr,
                    backgroundColor: rdmClr,
                    borderWidth: 1
                };
                dataSets.push(dataSet);
                
                function rdmRGB() 
                {
                    return Math.floor(Math.random() * 156 + 100);
                };
            });
            let yInterval = setInterval(() => 
            {
                if ($(".container.reports").css(`display`) == "none") 
                {
                    clearInterval(yInterval);
                };
                $.each(graphCurrenciesArr, (i, currencyData) => 
                {
                    myChart.data.datasets.data = getY(myChart.data.datasets[i].label, myChart.data.datasets[i].data);
                });
                getX();
                myChart.update(config);
            }, 2000);
        
            function getY(currency, y, i) 
            {//Worth in usd (Y).
                if (graphCurrenciesArr.length > 0) 
                {//get "LIVE" updates from server response.
                    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${currency}&tsyms=USD`)
                    .then(response => response.json())
                    .then(currencies => 
                    {
                        y.push(currencies[currency].USD);
                        if (y.length == 16) 
                        {
                            y.splice(0, 1);
                        }
                    })
                    .catch(function () 
                    {//if server response is negative.
                        hideY(currency, i);
                        if (graphCurrenciesArr.length == 1) 
                        {
                            alert(`${currency}'s price is unavailable at the moment`);
                            clearInterval(yInterval);
                            myChart.update(config);
                        }
                    });
                }
            }
            function getX() 
                {//Time declaration on interval every 2 seconds (X).
                s += 2;
                    if (s == 60) 
                    {
                        s = 0;
                        m += 1;
                    }
                    if (s >= 10) 
                    {
                        xAxis.push(`${m}:${s}`);
                    }
                    else 
                    {
                        xAxis.push(`${m}:0${s}`);
                    }
                    if (xAxis.length == 16) 
                    {
                        xAxis.splice(0, 1);
                    };
                };
                return dataSets;
        };
        var myChart = Chart.Line(ctx, config);
        function hideY(currency, i) 
        {
            config.data.datasets[i] = 
            {
                label: currency,
                hidden: true,
                data: []
            };
        }
    }
});