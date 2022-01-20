const $=document.querySelector.bind(document)
const $$=document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY='MUSIC_PLAYER'

const playlist=$('.playlist')
const heading=$('header h2')
const cdThumb=$('.cd-thumb')
const audio=$('#audio')
const cd=$('.cd')
const playBtn=$('.btn-toggle-play')
const player = $('.player')
const progress=$('#progress')
const prevBtn=$('.btn-prev')
const nextBtn=$('.btn-next')
const randomBtn=$('.btn-random')
const repeatBtn=$('.btn-repeat')


const app={
    currentIndex:0,
    isPlaying:false,
    isRandom:false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))||{},
    songs: [
        {
            name:'Galaxy',
            singer:'BOL4',
            path:'./assets/music/song1.mp3',
            image: './assets/img/img1.jpg'
        },
        {
            name:'Say yes',
            singer:'Loco, Punch',
            path:'./assets/music/song2.mp3',
            image: './assets/img/img2.jpg'
        },
        {
            name:'Tell me you love me',
            singer:'BOL4',
            path:'./assets/music/song3.mp3',
            image: './assets/img/img3.jpg'
        },
        {
            name:'You(=I)',
            singer:'BOL4',
            path:'./assets/music/song4.mp3',
            image: './assets/img/img4.jpg'
        },
        {
            name:'Jam Jam',
            singer:'IU',
            path:'./assets/music/song5.mp3',
            image: './assets/img/img5.jpg'
        },
        {
            name:'Psycho',
            singer:'Red Velvet',
            path:'./assets/music/song6.mp3',
            image: './assets/img/img6.jpg'
        },
        {
            name:'Blueming',
            singer:'IU',
            path:'./assets/music/song7.mp3',
            image: './assets/img/img7.jpg'
        },
        {
            name:'BBIBBI',
            singer:'IU',
            path:'./assets/music/song8.mp3',
            image: './assets/img/img8.jpg'
        },
    ],

    setConfig:function(key, value){
        this.config[key]=value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render:function(){
        const htmls=this.songs.map((song,index)=>{
            return `
                <div class="song ${index ===this.currentIndex ?'active' : '' }" data-index='${index}'>
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })

        $('.playlist').innerHTML=htmls.join('')
    },

    //Định nghĩa các thuộc tính cho Object
    defineProperties:function(){
        Object.defineProperty(this,'currentSong',{
            get:function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    //Lắng nghe / xử lý các sự kiện (DOM events)
    handleEvents:function(){
        const _this=this
        const cdWidth = cd.offsetWidth
        

        //Xử lý CD quay / dừng
        const cdThumbAnimation=cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration:10000, //10 seconds
            iterations: Infinity,
        })

        cdThumbAnimation.pause()

        //Xử lý phóng to thu nhỏ cd
        document.onscroll=function(){
            const scrollTop=window.scrollY
            const newCdWidth=cdWidth-scrollTop
            cd.style.width=newCdWidth>0 ?newCdWidth + 'px' :0
            cd.style.opacity=newCdWidth/cdWidth
        }

        //Xử lý khi click thu
        playBtn.onclick=function(){
            if(_this.isPlaying){
                _this.isPlaying=false
                audio.pause()
                player.classList.remove('playing')
                cdThumbAnimation.pause()
            }
            else{
                audio.play();
                cdThumbAnimation.play()
            }
            
        }

        //Khi song duoc play
        audio.onplay=function(){
            _this.isPlaying=true
            player.classList.add('playing')
        }

        //Khi song bi pause
        audio.onpause=function(){
            _this.isPlaying=false
            player.classList.remove('playing')
        }

        //Khi tien do bai hat thay doi
        audio.ontimeupdate=function(){
            if(audio.duration){
                const progressPercent=Math.floor(audio.currentTime / audio.duration *100)
                progress.value=progressPercent
            }
        }

        //Xu ly khi tua song    
        progress.onchange=function(e){
            const seekTime=audio.duration /100 *e.target.value
            audio.currentTime=seekTime
        }

        //Khi click nut next
        nextBtn.onclick=function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{

                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        prevBtn.onclick=function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
            _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        randomBtn.onclick=function(e){
            _this.isRandom=!_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
            
        }

        //Xử lý lặp lại một song
        repeatBtn.onclick=function(e){
            _this.isRepeat=!_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
            
        }

        //Xử lý next song khi audio cd
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
            
        }

        //Lắng nghe sự kiện click vào playlist
        playlist.onclick=function(e){
            const songNode=e.target.closest('.song:not(.active)')
            if(songNode||e.target.closest('.option')){

                //Xử lý khi click vào song
                if(songNode){
                    _this.currentIndex=parseInt(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                //Xử lý khi click vào option
            }
        }
    },

    //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    loadCurrentSong:function(){
        heading.textContent= this.currentSong.name
        cdThumb.style.backgroundImage=`url(${this.currentSong.image})`
        audio.src=this.currentSong.path
    },

    loadConfig:function(){
        this.isRandom=this.config.isRandom
        this.isRepeat=this.config.isRepeat
    },

    scrollToActiveSong:function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block:'center',
            })
        },200)
        
    },

    nextSong:function(){
        this.currentIndex++;
        if(this.currentIndex>=this.songs.length){
            this.currentIndex=0
        }
        this.loadCurrentSong()
    },

   prevSong:function(){
        this.currentIndex--;
        if(this.currentIndex<0){
            this.currentIndex=this.songs.length
        }
        this.loadCurrentSong()
    },

    playRandomSong:function(){
        let newIndex
        do{
            newIndex=Math.floor(Math.random()*this.songs.length)
        }while (this.currentIndex === newIndex)

        this.currentIndex=newIndex
        this.loadCurrentSong()
    },

    start:function(){
        //Gán cấu hình từ config vào Object
        this.loadConfig()

        //Định nghĩa các thuộc tính cho Object

        this.defineProperties()

        //Lắng nghe/ xử lý các sự kiện (DOM events)
        this.handleEvents()

        //Tải thông tin bài hát
        this.loadCurrentSong()

        //Render playlist
        this.render()

        //Hiển thị trạng thái ban đầu của button repeat/ random
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',_this.isRepeat)

    }
}

app.start()