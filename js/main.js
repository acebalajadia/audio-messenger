new Vue({
    el: '#vueroot',
    data: {
        isRecording: false,
        recordings: []
    },
    mounted: function () {
        this.$nextTick(function () {
            var idCounter = 1;
            //get index
            idCounter = localStorage.getItem('audio-messenger-saveIndex') ? localStorage.getItem('audio-messenger-saveIndex') : 0;

            for (let index = 1; index <= idCounter; index++) {
                let savedData = localStorage.getItem(audioMessengerFileStorageName + index);
                let jsondata;
                if (savedData) {
                    jsondata = JSON.parse(savedData);
                    var ax = new Audio();
                    ax.src = jsondata.audiob64;

                    let recording = {
                        id: audioMessengerFileStorageName + index,
                        audiob64: jsondata.audiob64,
                        audioUrl: 'test',
                        audio: ax
                    }

                    this.recordings.push(recording);

                } 
                
            } 



        })
    },
    methods: {
        deleteRecording: function (item, index) {
            localStorage.removeItem(item.id);
            this.recordings.splice(index, 1);
        },
        record: function (e) {
            (async () => {
                const recorder = await recordAudio();
                this.isRecording = true;
                recorder.start();
                await sleep(3000);
                const audio = await recorder.stop();

                // audio.play();
                this.isRecording = false;
                // this.recordings.push(audio);

                const reader = new FileReader();

                // This fires after the blob has been read/loaded.
                reader.addEventListener('loadend', (e) => {
                    let audioForSaving = {
                        audiob64: reader.result.toString(),
                        audioUrl: 'test'
                    };

                    var newId = saveToLocalStorage(JSON.stringify(audioForSaving))

                    var ax = new Audio();
                    ax.src = reader.result.toString();
                    ax.play();

                    let recording = {
                        id: newId,
                        audiob64: reader.result.toString(),
                        audioUrl: 'test',
                        audio: ax
                    }

                    this.recordings.push(recording);
                });

                // Start reading the blob as text.
                reader.readAsDataURL(audio.audioBlob);


            })();

        },
        play: function (item) {
            item.audio.play();
        },
        combineAudio: function () {
            const chunks = [];
            for (let index = 0; index < this.recordings.length; index++) {
                const element = this.recordings[index];
                if (element.isSelected) {
                    // chunks.push(element.audioBlob);
                    const audioBlob = dataURItoBlob(element.audiob64);
                    chunks.push(audioBlob)
                }
            }

            if (chunks.length) {
                const audioBlob = new Blob(chunks, { type: 'audio/aac' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                audio.play(); //let's here it
            }
        },

    }
});

var audioMessengerFileStorageName = 'audio-messenger-recordings';

function saveToLocalStorage(jsondata) {
    var idCounter = 0;
    //get index
    idCounter = localStorage.getItem('audio-messenger-saveIndex') ? localStorage.getItem('audio-messenger-saveIndex') : 0;

    var savedIndex = idCounter.length,
        newIndex = 1;

    if (idCounter.length > 0) {
        var lastindex = parseInt(idCounter);
        newIndex = lastindex + 1;
    }

    idCounter = newIndex;
    localStorage.setItem('audio-messenger-saveIndex', idCounter);
    localStorage.setItem(audioMessengerFileStorageName + newIndex, jsondata);

    return audioMessengerFileStorageName + newIndex;
}


const recordAudio = () =>
    new Promise(async resolve => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
        });

        const start = () => mediaRecorder.start();

        const stop = () =>
            new Promise(resolve => {
                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/aac' });
                    // const audioBlob = new Blob(audioChunks);
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    const play = () => audio.play();
                    const isSelected = false;
                    resolve({ audioBlob, audioUrl, play, audioChunks });
                });

                mediaRecorder.stop();
            });

        resolve({ start, stop });
    });


const sleep = time => new Promise(resolve => setTimeout(resolve, time));


function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: mimeString });
    return blob;

}