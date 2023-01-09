let http = require('http');
let fs = require('fs')
let url = require('url')


let categories=JSON.parse(fs.readFileSync('./model/categories.json'));
let subCategories=JSON.parse(fs.readFileSync('./model/subCategories.json'));
let products = JSON.parse(fs.readFileSync('./model/products.json'));
let server = http.createServer();

server.on('request', (req, res)=>{
    let req_url = req.url
    let queries = Object.entries(url.parse(req_url, true).query);
    let route = url.parse(req_url, true).pathname.split('/')[1];
    let id = url.parse(req_url, true).pathname.split('/')[2];
    // console.log(route, id, queries);
    
    if(req.method == 'GET'){
        if(route == 'categories' && !id){
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

        if(route == 'categories' && id){
            let cat=[];
            categories.forEach(c => {
                if(c.category_id == id){
                    let subCategory=[];
                    subCategories.forEach(s => {
                        if(s.category_id == c.category_id){
                            subCategory.push(s)
                        }
                    })
    
                    c.subCategories=subCategory
                    cat.push(c)
                }
               
            })
            res.writeHead(200, {"content-type": "application.json"});
            return res.end(JSON.stringify(cat));
        }

        if(route == 'subcategories' && !id){
            let subCat=[];
            
            subCategories.forEach(s => {
                let product=[];
                products.forEach(p => {
                    if(p.sub_category_id == s.sub_category_id){
                        product.push(p)
                    }
                })
                s.products=product
                subCat.push(s)
            })
            res.writeHead(200, {"content-type": "application.json"});
            return res.end(JSON.stringify(subCat));
        }

        if(route == 'subcategories' && id){
            let subCat=[];
            
            subCategories.forEach(s => {
                if(s.sub_category_id == id){
                    let product=[];
                    products.forEach(p => {
                        if(p.sub_category_id == s.sub_category_id){
                        product.push(p)
                        }
                    })
                    s.products=product
                    subCat.push(s)
                }
                
            })
            res.writeHead(200, {"content-type": "application.json"});
            return res.end(JSON.stringify(subCat));
        }

        

    }
    
})


server.listen("4000", ()=>{
    console.log("Server running on port 4000 ...");
})