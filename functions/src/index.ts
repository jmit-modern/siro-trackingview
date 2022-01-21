import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

// // Users Collection
// type UserDocument = {
// 	id: string; // Unique id of the user. Mathes both the document id and the user's auth id
// }

// // Recordings Collection
// type RecordingDocument = {
// 	id: string; // Unique id for recording. Matches document id.
// 	creatorId: string; // Id of the user that created this recording
// views: number;  //Total views of the recoring by users
// }

// Views Collection
type ViewDocument = {
  userId: string; // Id of the user that view the recording
  recordingId: string; // Id of the recording that is viewed by the user
}

// Create User
exports.addUser = functions.https.onRequest(async (req, res) => {
    
  const userId = req.body.id
  await admin.firestore().collection('users').doc(userId).set({userId: userId})

  res.json({result: "User created"})
})

//Create recording
exports.addRecording = functions.https.onRequest(async (req, res) => {
    
  const recordingId = req.body.id
  const creatorId = req.body.userId

  await admin.firestore().collection('recordings').doc(recordingId).set({id: recordingId, creatorId: creatorId, views: 0})

  res.json({result: "Recording created"})
})

exports.addView = functions.https.onRequest(async (req, res) => {

  const recordingId = req.body.recordingId
  const userId = req.body.userId

  // If views collection does not exist, create collection and store view doc
  const viewCollectionRef = await admin.firestore().collection('views').get()
  if(viewCollectionRef.empty) {
    await admin.firestore().collection('views').add({userId: userId, recordingId: recordingId})
    res.json({result: "Views created"})
  }else{
    // Check View exists
    const viewExists = await admin.firestore().collection('views')
    .where("recordingId", "==", recordingId)
    .where("userId", "==", userId)
    .get()
    .then(function (querySnapshot) {
      return !querySnapshot.empty
    });

    console.log(viewExists)
    //Create Views
    if(!viewExists) {
    await admin.firestore().collection('views').add({userId: userId, recordingId: recordingId})
    res.json({result: "Views created"})
    } else {
    res.json({result: "User already viewed the record"})
    }
  }
});

// Oncreate view find the according recording and increment 1 views
exports.upvoteView = functions.firestore.document('/views/{documentId}')
.onCreate((snap, context) => {
  // Find the recoridng that matches the view recordingId  
  const recordingId = snap.data().recordingId;
  const recording = admin.firestore().collection("recordings").doc(recordingId)
  //Increment 1 views value of the recording
  return recording.update({
    views: admin.firestore.FieldValue.increment(1)
  });
});


//Callable function onCallTrackRecordingView
exports.onCallTrackRecordingView = functions.https.onCall(async (data: ViewDocument, context) => {
  const recordingId = data.recordingId
  const userId = data.userId

  // If views collection does not exist, create collection and store view doc
  const viewCollectionRef = await admin.firestore().collection('views').get()
  if(viewCollectionRef.empty) {
    return admin.firestore().collection('views').add({userId: userId, recordingId: recordingId})
  }else{
    // Check View exists
    const viewExists = await admin.firestore().collection('views')
    .where("recordingId", "==", recordingId)
    .where("userId", "==", userId)
    .get()
    .then(function (querySnapshot) {
      return !querySnapshot.empty
    });

    //Create Views
    if(!viewExists) {
      return admin.firestore().collection('views').add({userId: userId, recordingId: recordingId})
    } else {
      throw new functions.https.HttpsError(
        'failed-precondition', 
        'The user already viewed this recording'
      );
    }
  }
})