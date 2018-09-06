new Vue({
    el: '#vueroot',
    data: {
        isRecording: false,
        recordings: []
    },
    methods: {
        record: function (e) {
            console.log(e);
            (async () => {
                const recorder = await recordAudio();
                this.isRecording = true;
                recorder.start();
                await sleep(3000);
                const audio = await recorder.stop();
                // audio.play();
                this.isRecording = false;
                this.recordings.push(audio);
            })();

        },
        play: function (audio) {
            audio.play();
        },
        combineAudio: function () {
            const chunks = []; 
            for (let index = 0; index < this.recordings.length; index++) {
                const element = this.recordings[index];
                if (element.isSelected){
                    chunks.push(element.audioBlob);
                }
            }

            if(chunks.length){
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


