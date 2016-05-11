<html>

	<head>
		<title>Observerable Patern</title>
		<script src="ajax_helper.js"></script>
		<script type="text/javascript">
		//THIS PART DOESN'T WHAT FUNCTIONS TO BE CALLED, WHAT KIND OF DATA IT IS HANDLING
		//IT OBSERVERS WILL DO THAT JOB. IT ONLY ACT AS A MODEL------------------------------
			//Observable object which is observe by observers
			observable=new Object();
			//room to keep the observers
			observable.observers=new Array();
			//communicate with observers
			observable.notify=function(message){
				for(i=0;i<this.observers.length;i++){
					//all  observers must have the doWork function
					this.observers[i].doWork(message);
				}
			}
			//register an observer
			observable.addObservers=function(observer){
				this.observers[this.observers.length]=observer;
			}
			//remove an observer
			observable.removeObservers=function(observerName){
				for(i=0;i<=this.observers.length;i++){
					if(this.observers[i].Name=observerName){
						this.observers.splice(i,1);
					}
				}
				
			}
		//--------------------------------------------------------------------------------------	
			//An Observer object.THE OBSERVABLE DOESN'T KNOW ABOUT IT UNTILL IT REGISTERS ITSELF --------------------
			function addCelsiusDisplay(checkbox){
				if(checkbox.checked==true){
					observer1=new Object();
					//an unique identity for the observer
					observer1.Name="celsiusdisplay"
					observer1.doWork= function(information){
						document.getElementById("celsius_display").value=information;
					}
					//register the observer
					observable.addObservers(observer1);
				}else{
					//remove the observer
					observable.removeObservers("celsiusdisplay");
				}
			}
			//-------------------------------------------------------------
			
			//Another Observer Object---------------------------------
			function addFarenheitDisplay(checkbox){
				if(checkbox.checked==true){
					observer1=new Object();
					observer1.Name="farenheitdisplay"
					observer1.doWork= function(information){
						var farenheit=information*(9/5)+32;
						document.getElementById("farenheit_display").value=farenheit;
					}
					observable.addObservers(observer1);
				}else{
					observable.removeObservers("farenheitdisplay");
				}
			}	
			//--------------------------------------------------------
			
			function getData(){
				//creates XML Http object
				var ajaxRequest=createXMLHttp();
				//make open request with unique url to avoid cache related issues
				ajaxRequest.open("GET", "temperature.php?unique_request="+Math.random(), true);
				 ajaxRequest.onreadystatechange=function()
				 {
						 if(ajaxRequest.readyState==4 &&
						 ajaxRequest.status==200){
							//call the observable function which inturn notify its observers
							observable.notify(ajaxRequest.responseText);
						 }


				 }
				ajaxRequest.send(null);				
		 }
		 //communicate server in every 2 secs
		t=setInterval(getData,2000);
			
		function test(){
			getData();
		}
		</script>
	</head>
	<body>
		<div><h2>My Weather Updates</h2></div>
		<div>
			Degree Celsius:<input type="text", id="celsius_display" />
			<input type="checkbox"  onclick="addCelsiusDisplay(this)" />
			<!--<input type="button" onclick="test();" value="Test" />-->
		</div>
		<div>
			Degree Farenheit:<input type="text", id="farenheit_display" />
			<input type="checkbox"  onclick="addFarenheitDisplay(this)" />
		</div>
	</body>
</html>
		
	