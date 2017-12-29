Steps to build an Ionic Android App on Windows

1- Setup GitHub on your machine
	1.1- This video provides some good insights: https://www.youtube.com/watch?v=J_Clau1bYco
	1.2- To download Git go to: https://git-scm.com/download/win
	1.3- Open bash and run: $ git clone ***(the https address to the repository)***
2- Setup Ionic environment - as it's shown in the link: https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html
	2.1- This video provides some good insights: https://www.youtube.com/watch?v=oxiRp2BfDnA
	2.2- Install Java SE JDK 8
		http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
	2.3 Set the environment variable to JAVA_HOME
		2.3.1- The path to be added is: C:\Program Files\Java\jdk1.8.0_151
		2.3.2- On Control Panel it's necessary to look for: Configurações Avançadas do Sistema -> Variáveis de Ambiente -> Novo
		2.3.3- In "Nome da variavés" set: JAVA_HOME
		2.3.4- In "Valor da variável" set: the path shown above - C:\Program Files\Java\jdk1.8.0_151
	2.4- Install Android Studio
		https://developer.android.com/studio/index.html
	2.5 Set the environment variable to ANDROID_HOME
		2.5.1- The path to be added is: C:\Users\ADM\AppData\Local\Android\Sdk
		2.5.2- It's possible that the folder "AppData" won't appear in the user folder, if so it's necessary to allow the hiden folders to be visible
			2.5.2.1- Go to "Exibir"
			2.5.2.2- "Options"
			2.5.2.3- "Alterar opções de pasta e pesquisa"
			2.5.2.4- "Modo de Exibição"
			2.5.2.5- Mark the buttom: "Mostrar arquivos, pastas e unidades ocultas"; Unmark the buttons: "Ocultar unidades vazias", "Ocultar conflitos de mesclagem de pasta", "OCultar extensões dos tipos de arquivo conhecidos", Ocultar arquivos protegidos do sistema operacional"
		2.5.3- On Control Panel it's necessary to look for: Configurações Avançadas do Sistema -> Variáveis de Ambiente -> Novo
		2.5.4- In "Nome da variavés" set: ANDROID_HOME
		2.5.5- In "Valor da variável" set: the path shown above - C:\Users\ADM\AppData\Local\Android\Sdk
3- Setup NodeJS
	3.1- Install Node JS at: https://nodejs.org/en/download/
4- Setup Cordova Ionic
	4.1- On shel run: $ npm install -g cordova ionic
	4.2- Accept the terms
		4.2.1- On shel run $ cd C:\Users\ADM\AppData\Local\Android\Sdk\tools\bin
		4.2.2- On shel run $ sdkmanager --licenses
	4.3- Add the android platform
		4.3.1 On shel run $ ionic cordova platform android
5- Build the project
	5.1 Go inside the folder where is your project
	5.2 On shel run $ npm i
	5.3 On shel run $ ionic cordova build android

Do it, just do it!