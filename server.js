let http = require('http');
let fs = require('fs')

let categories=JSON.parse(fs.readFileSync('./model/categories.json'));
let subCategories=JSON.parse(fs.readFileSync('./model/subCategories.json'));

let server = http.createServer();

server.on('request', (req, res)=>{
    if(req.method == 'GET'){
        if(req.url == '/categories'){
            let cat=[];
            
            categories.forEach(c => {
                let subCategory=[];
                subCategories.forEach(s => {
                    if(s.category_id == c.category_id){
                        subCategory.push(s)
                    }
                })
                c.subCategories=subCategory
                cat.push(c)
            })
            res.writeHead(200, {"content-type": "application.json"});
            return res.end(JSON.stringify(cat));
        }

    }
})


server.listen("4000", ()=>{
    console.log("Server running on port 4000 ...");
})