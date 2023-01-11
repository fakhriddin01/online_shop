let http = require('http');
let fs = require('fs')
let url = require('url')


let categories=JSON.parse(fs.readFileSync('./model/categories.json'));
let subCategories=JSON.parse(fs.readFileSync('./model/subCategories.json'));
let products = JSON.parse(fs.readFileSync('./model/products.json'));

let {get_categories, get_categories_by_id, get_subCategories, get_subCategories_by_id, get_products_by_id, get_subCategories_by_category_id, camelToUnderscore, filter_products} = require('./src/functions')
let server = http.createServer();


server.on('request', (req, res)=>{
    let req_url = req.url
    let queries = Object.entries(url.parse(req_url, true).query);
    let queries_keys = Object.keys(url.parse(req_url, true).query);
    let route = url.parse(req_url, true).pathname.split('/')[1];
    let id = url.parse(req_url, true).pathname.split('/')[2];
    
    
    if(req.method == 'GET'){

        // categories AND categories/id
        if(route == 'categories' && !id){
            get_categories(req, res);
        }

        if(route == 'categories' && id){
            get_categories_by_id(req, res, id);
        }


        // subcategories AND subcategories/id
        if(route == 'subcategories' && !id){
            get_subCategories(req, res)
        }


        if(route == 'subcategories' && id){
            get_subCategories_by_id(req, res, id)
        }

        // products 
        if(route == 'products' && id){
            get_products_by_id(req, res, id)
        }

        // products with queries
        if(route == 'products' && queries.length!=0){
            let result = filter_products(queries, queries_keys)

            res.writeHead(200, {"content-type": "application.json"})
            res.end(JSON.stringify({
                msg: "filtered_products by query",
                items: result.length,
                products: result
            })) 
        }

    }
    
})


server.listen("4000", ()=>{
    console.log("Server running on port 4000 ...");
})