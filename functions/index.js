const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// Instalar firebase-tools: npm install -g firebase-tools
// Inicializar cloud functions: firebase init functions
// DEPLOY firebase deploy --only functions

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/**
 * Envia notificação quando um evento é criado/motificado em `/events/{eventId}`.
 *
 * Os dispositivos possuem os ids dos usuários `/devicesUsers/${smartCode}/users`.
 * 
 * Alguns links:
 * https://mobikul.com/sending-notification-firebase-cloud-functions/
 * https://aaronczichon.de/2017/03/13/firebase-cloud-functions/
 * https://github.com/firebase/functions-samples/blob/master/fcm-notifications/functions/index.js
 * https://github.com/MahmoudAlyuDeen/FirebaseIM/blob/master/server/functions/index.js
 * https://android.jlelse.eu/serverless-notifications-with-cloud-functions-for-firebase-685d7c327cd4
 * https://android.jlelse.eu/cloud-functions-for-firebase-device-to-device-push-notification-f4c548fd9b7d
 * 
 */
exports.sendPushNotification = functions.database.ref('/events/{eventId}').onWrite(eventFb => {
  const event = eventFb.data.val();
  const imei = event["Imei"];
  if (!imei) {
    return;
  }
  
  //obter usuarios do dispositivo do evento
  const devicesUsersPromise = admin.database().ref(`devicesUsers`).orderByChild("imei").equalTo(imei).once("value");

  return Promise.all([devicesUsersPromise]).then((devicesUsersFb) => {
    var tokens = [];
    if(event.Tipo.toLowerCase() == 'help me') {
      admin.database().ref("users").once("value").then((snapshot) => {
        const users = snapshot.val();
        var userOwner = null;

        // Encontra o dono do imei
        Object.keys(users).map(key => {
          const cars = users[key].cars;
          Object.keys(cars).map(keyCar => {
            if(cars[keyCar].Imei == imei) {
              userOwner = users[key];
            }
          });
        });
        
        
        // Encontra os tokens pra enviar
        Object.keys(userOwner.sharingWithOthers).map((keySharing) => {
          const uid = userOwner.sharingWithOthers[keySharing];
          console.log(uid);
          
          admin.database().ref("devicesUsers").orderByChild("uid").equalTo(uid).once("value").then((devicesUsersFbHelp) => {
            const devicesUsers = devicesUsersFbHelp.val();

            Object.keys(devicesUsers).map(deviceUsersKey => {
              tokens.push(devicesUsers[deviceUsersKey].token);
            });

            const payload = {
              notification: {
                title: "Compartilhamento de Posição",
                body: userOwner.name + " está compartilhando sua localização com você",
                sound: "default"
              }
            }
            return admin.messaging().sendToDevice(tokens, payload);
          });
        });
      });
    } else {
      const devicesUsers = devicesUsersFb[0].val();
      Object.keys(devicesUsers).map(key => {
        tokens.push(devicesUsers[key].token);
      })
      var title = body = null;
      switch(event.Tipo.toLowerCase()) {
        case 'sensor alarm':
        case 'door alarm':
          title = "Atenção!";
          body = "Um alerta foi identificado";
          break;
      }
      if(!title || !body) {
        return;
      }
      const payload = {
        notification: { title, body, sound: "default" }
      }
      return admin.messaging().sendToDevice(tokens, payload);
    }
    
  })


  
  /*
  return Promise.all([getUsersPromise]).then(results => {
    const users = results[0].val();

    const userIds = Object.keys(users).map(function(key) {
      return users[key];
    });

  // para cada usuário
    userIds.map(function(userId) {
      if(!userId) {
        return;
      }

      // obter dados do usuário
      const userPromise = admin.database().ref(`/users/${userId}`).once('value');
      
      return Promise.all([userPromise]).then(results2 => {
        const user = results2[0].val();
        const userSnapShot = results2[0];

        if (!user) {
          return;
        }

        const payload = {
          notification: {
            title: 'Um incidente ocorreu!',
            body: `Algo de errado não está certo.`,
          }
        };
            
        const tokens = user["pushNotificationTokens"];

        console.log(tokens);
        if (!tokens || !tokens.length) {
          return;
        }

        //enviar notificação
        return admin.messaging().sendToDevice(tokens, payload).then(response => {
          const tokensToRemove = [];
          response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
              console.error('Failure sending notification to', tokens[index], error);
              // limpar tokens inválidos
              if (error.code === 'messaging/invalid-registration-token' ||
                  error.code === 'messaging/registration-token-not-registered') {
                tokensToRemove.push(userSnapShot.ref.child('pushNotificationTokens').child(index).remove());                
              }
            }
          });
          return Promise.all(tokensToRemove);
        });
      })
    })
  }); */
});