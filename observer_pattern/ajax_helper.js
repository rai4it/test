
function createXMLHttp(){
        if(window.XMLHttpRequest){
                oXmlHttp= new XMLHttpRequest();
                return oXmlHttp
        } else {
                var aVersions=["MSXML2.XMLHttp.5.0",
                "MSXML2.XMLHttp.4.0","MSXML2.XMLHttp.3.0",
                "MSXML2.XMLHttp","Microsoft.XMLHttp"
                ];

               for(var i=0; i<aVersions.length; i++){
                       try{
                               var oXmlHttpNew=new ActiveXObject(aVersions[i]);
                               oXmlHttp=oXmlHttpNew;
                               return oXmlHttp;
                       } catch(oError) {

                       }
               }
               throw new Error("XMLHttp object could not be created");
        }
}

