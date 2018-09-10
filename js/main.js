new Vue({
    el: '#vueroot',
    data: {
        isRecording: false,
        recordings: []
    },
    mounted: function () {
        this.$nextTick(function () {
            // localStorage.setItem('audio-messenger-recordings1', '');
            let savedData = localStorage.getItem('audio-messenger-recordings1');
            let jsondata;
            if (savedData) {
                jsondata = JSON.parse(savedData);
                var ax = new Audio();
                ax.src = jsondata.audiob64;


                let recording = {
                    audiob64: jsondata.audiob64,
                    audioUrl: 'test',
                    audio:ax
                }

                this.recordings.push(recording);

            }
 
          
        })
    },
    methods: {
        record: function (e) {
            console.log(e);
            (async () => {
                const recorder = await recordAudio();
                this.isRecording = true;
                recorder.start();
                await sleep(1000);
                const audio = await recorder.stop();

                // audio.play();
                this.isRecording = false;
                // this.recordings.push(audio);

                const reader = new FileReader();

                // This fires after the blob has been read/loaded.
                reader.addEventListener('loadend', (e) => {
                    const text = e.srcElement.result;
                    let audioForSaving = {
                        audiob64: reader.result.toString(),
                        audioUrl: 'test'
                    };

                    localStorage.setItem('audio-messenger-recordings1', JSON.stringify(audioForSaving));

                    var ax = new Audio();
                    ax.src = reader.result.toString();
                    ax.play(); 
 

                    let recording = {
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
})


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