# siro-trackingview

Firebase functions to track the user view counts for the recordings

## How to run emulator

Run the command below to run the eumulator.

To run the emulator you should have the project "project-name" in the firebase.
```
firebase emulators:start --project "project-name"
```

## Schema

```

// Users Collection
type UserDocument = {
  id: string; // Unique id of the user. Mathes both the document id and the user's auth id
}

// Recordings Collection
type RecordingDocument = {
  id: string; // Unique id for recording. Matches document id.
  creatorId: string; // Id of the user that created this recording
  views: number;  //Total views of the recoring by users
}

// Views Collection
type ViewDocument = {
  userId: string; // Id of the user that view the recording
  recordingId: string; // Id of the recording that is viewed by the user
}

```
