
Quiero hacer un pequeño proyeccto para lanzar pruebas sobre un bot de la plataforma conversacional Cognigy.
Estoy en un proyecto donde se ha desarrollado en Cognigy un bot tipo copilot para dar soporte a un agente humano en el contact center mientras habla con el cliente.
En el contact center hay una página donde cuando llega una nueva llamada, se abre una sesion en el bot de copilot, y se le pasan las transcriciones de lo que dice el cliente y el agente humano. El bot de copilot analiza la información e intenta identificar el caso de uso apropiado (clasificación). Según el caso de uso, se presenta en el iframe un pequeño formulario con los campos que se van detectando durante la conversacion. Y cuando el agente humano lo considera apropiado, hace click en un boton de submit del iframe para que se lance una acción asociada al caso de uso con los datos capturados, esto le llega al bot de copilot como un evento.
Tengo una versión funcionando del bot de copilot, pero necesito lanzar pruebas con transcripciones de conversaciones reales.ç
Objetivo: Montar una pequeña aplicacion que permita procesar las transcripciones, simulando que el cliente y/o agente humano estan hablando y se envien al bot de copilot de Cognigy. Y eventualmente, se debe poder enviar un evento para simular el submit del agente, el evento puede estar "hardcodeado" en la transcripcion con el formato que más nos convenga, por ejemplo una linea [SUBMIT EVENT A].

¿Como lo hacemos?
Había pensado que hay dos partes:
1- Hacer una aplicacion que muestre una web simple donde incrustar el iframe del copilot, y desde donde se pueda cargar un fichero txt con el transcript (y se vea en un lateral de la pantalla el contenido de los mensajes)
2- Una vez tengamos la página web, debería haber un botón de START para que se cree una sesión con el bot de copilot de cognigy, incrustar el iframe, y que empiece a enviar cada seguno un mensaje del transcript que se ha cargado. Debe haber un boton PAUSE para parar temporalmente el envio de mensajes, pero que se pueda reanudar posteriormente.

¿Con qué tecnología?
Había pensado algo sencillo con NodeJS, quizás una misma aplicacion que levante una página HTML y tenga los servicios de back es suficiente, porque es una herramienta de uso interno.
Sobre dependencias, incluye el mínimo de las librerías, sólo las que consideres importantes o necesarias para realizar este proyecto.

¿Como es la comunicacion con Cognigy?
La conexión con el bot de copilot de Cognigy se establece mediante un socket en la siguiente url:
https://endpoint-eu-dev-cai.cognigy.cloud/3e0aadbf61d13830f0831264e6adf289ae56068b957fff917759ec9af0e83522
Cuando se establece la conexión el bot responde un mensaje indicando la url del iframe, que cambia en cada nueva conexion y es de la forma:
https://ai-copilot-eu-dev-cai.cognigy.cloud/?userId={{input.userId}}&sessionId={{input.sessionId}}&URLToken={{input.URLToken}}

¿Como es el fichero de transcripciones?
En el fichero de transcript hay una linea que indica la persona que habla antes del mensaje (marca de tiempo tipo "00:00:02" y la persona "Speaker x"). Normalmente hay dos personas en la conversacion (1 es el agente humano y 2 el cliente).
Por ejemplo:
00:00:02 Speaker 1
Good afternoon, welcome to Allianz Portugal. My name is Isabela Franco. How may I help you?
00:00:06 Speaker 2
Good afternoon, Isabela. Here's the thing: I filed a claim, but I changed my policy.
00:00:16 Speaker 2
And in the meantime, I asked for this report to be forwarded to the correct policy, but I haven't had any feedback and I wanted to know what the status of this report is.
00:00:32 Speaker 1
Of course it was.
00:00:34 Speaker 2
Through BPI. I don't know if it makes any difference, no.
00:00:38 Speaker 1
Yes.

Inicialmente, el tema de lanzar eventos lo dejamos sin implementar.

Pregúntame los datos que necesites, o aclaraciones necesarias.
Planteame primero que vas a construir y porque, paso a paso, y según te vaya dando el ok, lo vas creando.
Crea el proyecto en la carpeta "allianz-cognigy-copilot-tester".

