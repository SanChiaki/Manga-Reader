let app = new Vue({
  el: '#app',
  data: {
    images: [],
    page: 0,
    imgStyle:{
      height:this.pageHeight
    },
    view: true,
    step: 2,
  },
  methods: {
    pageDown(){
      if((this.page+this.step)<=this.pagesNum) this.page+=this.step;
      else alert("已经是最后一页");
    },
    pageUp(){
      if((this.page-this.step)>=0) this.page-=this.step;
      else alert("已经是第一页");
    },
    pageClose(){
      this.view = true;
      for(let url in this.images){
        URL.revokeObjectURL(url);
      }
      if(dirInput.value){
        localStorage.setItem(dirInput.files[0].webkitRelativePath.slice(0,-dirInput.files[0].name.length-1),this.page);
      }
      else{
        localStorage.setItem(zipInput.files[0].name,this.page);
      }
      dirInput.value = zipInput.value = "";
      this.images = [];
      this.page = 0;
    }
  },
  computed: {
    pagesNum(){
      return this.images.length-1;
    },
    pageSize(){
      return {
        height: document.documentElement.clientHeight+"px",
        width: document.documentElement.clientWidth+"px"
      }
    }
  }
})
let dirInput = document.getElementById("dirInput");
let zipInput = document.getElementById("zipInput");
let imgContainer = document.getElementById("imgContainer");

dirInput.onchange = ()=>{
  let images = dirInput.files;
  let array=[],promises = [];
  // console.log(new Date());
  for(let i=0;i<images.length;i++){
    promises.push(new Promise((resolve, reject)=>{
      array[i] = URL.createObjectURL(images[i])
      // console.log(array[i])
      resolve()
    }))
  }
  Promise.all(promises).then(function(){
    let page = localStorage.getItem(dirInput.files[0].webkitRelativePath.slice(0,-dirInput.files[0].name.length-1));
    if(page){
      app.page = parseInt(page);
    }
    for(let i=0;i<images.length;i++){
      app.images.push(array[i]);
    }
    // console.log(new Date());
  })

  app.view = false;
}

zipInput.onchange = () => {
  let file = zipInput.files[0];
  JSZip.loadAsync(file)
    .then(function (zip) {
      let promises = Object.keys(zip.files).map(function (fileName) {
        var file = zip.files[fileName];
        return file.async("blob").then(function (blob) {
          return [
            fileName,  // keep the link between the file name and the content
            URL.createObjectURL(blob) // create an url. img.src = URL.createObjectURL(...) will work
          ];
        });
      });
      // `promises` is an array of promises, `Promise.all` transforms it
      // into a promise of arrays
      return Promise.all(promises);
    }).then(function (result) {
      // we have here an array of [fileName, url]
      // if you want the same result as imageSrc:
      return result.reduce(function (acc, val) {
        acc[val[0]] = val[1];
        return acc;
      }, {});
    }).then(function(imgData){
      let page = localStorage.getItem(zipInput.files[0].name);
      console.log("this page is : "+page)
      if(page){
        app.page = parseInt(page);
      }
      for(let index in imgData){
        app.images.push(imgData[index])
        // console.log(imgData[index])
      }
    });
  app.view = false;
}

document.onkeyup = function (event) {
  var e = event || window.event;
  var keyCode = e.keyCode || e.which;
  switch (keyCode) {
      case 37:
          document.getElementById("pageDown").click();
          break;
      case 39:
          document.getElementById("pageUp").click();
          break;
      default:
          break;
  }
}