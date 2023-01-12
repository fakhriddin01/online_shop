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

    if(req.method == 'POST'){
        if(req_url == '/categories'){
            req.on('data', (chunk)=>{
                let exist;
                let data= JSON.parse(chunk)
                let entries = Object.entries(data)
                if(entries[0][0]!='categoryName'){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: "Please input correct propertry as 'categoryName' !"
                    }))
                }
                entries.forEach(el => el[0]=camelToUnderscore(el[0]))
                data = Object.fromEntries(entries);
                exist = categories.find(c => c.category_name.toLowerCase() == data.category_name.toLowerCase())
                if(exist){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: "this category_name already exist!"
                    }))
                }
                categories.push({category_id: categories.at(-1).category_id +1, ...data})
                fs.writeFile('./model/categories.json', JSON.stringify(categories), (err)=>{
                    if(err) throw err
                });

                res.writeHead(200, {"content-type": "application.json"})
                res.end(JSON.stringify({
                    msg: "Category added!"
                }))
            })
        }

        if(req_url == '/subCategories'){
            req.on('data', (chunk)=>{
                let exist;
                let data= JSON.parse(chunk)
                let entries = Object.entries(data)
                
                if(entries[0][0]!='categoryId' && entries[1][0]!='subCategoryName'){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: "Please input correct propertry as 'categoryName' !"
                    }))
                }
                entries.forEach(el => el[0]=camelToUnderscore(el[0]))
                data = Object.fromEntries(entries);

                if(!categories.find(c => c.category_id==data.category_id)){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: `Category:${data.category_id} doesn't exist!`
                    }))
                }

                exist = subCategories.find(s => {
                    if(s.sub_category_name.toLowerCase() == data.sub_category_name.toLowerCase() && s.category_id == data.category_id)
                    return s
                } )
                if(exist){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: `this sub_category_name in category:${data.category_id} already exist!`
                    }))
                }
                subCategories.push({sub_category_id: subCategories.at(-1).sub_category_id +1, ...data})
                fs.writeFile('./model/subCategories.json', JSON.stringify(subCategories), (err)=>{
                    if(err) throw err
                });

                res.writeHead(200, {"content-type": "application.json"})
                res.end(JSON.stringify({
                    msg: "subCategory added!"
                }))
            })
        }

        if(req_url == '/products'){
            req.on('data', (chunk)=>{
                let exist;
                let data= JSON.parse(chunk)
                let entries = Object.entries(data)
                
                if(entries[0][0]!='subCategoryName' || entries[1][0]!='productName' || entries[2][0]!='model' || entries[3][0]!='color' || entries[4][0]!='price'){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: "Please input correct propertry as below!",
                        form: {
                            subCategoryName: "",
                            productName: "",
                            model: "",
                            color:"",
                            price: ""
                        }
                    }))
                }
                entries.forEach(el => el[0]=camelToUnderscore(el[0]))
                data = Object.fromEntries(entries);
                if(!subCategories.find(s => s.sub_category_name == data.sub_category_name)){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: `sub_category with name:${data.sub_category_name}, doesn't exist!`
                    }))
                }
                products.push({product_id: products.at(-1).product_id +1, ...data});
                fs.writeFile('./model/products.json', JSON.stringify(products), (err)=>{
                    if(err) throw err
                })
                res.writeHead(200, {"content-type": "application.json"})
                res.end(JSON.stringify({
                    msg: "product added!"
                }))
            })
        }

    }

    if(req.method == "PUT"){
        if(req_url==`/categories/${id}`){
            req.on('data', chunk =>{
                let data = JSON.parse(chunk);
                let category = categories.find(c => c.category_id == id);
                if(!category){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: `category with id:${id}, not found!`
                    }))
                }
                let entries = Object.entries(data)
                entries.forEach(el => el[0]=camelToUnderscore(el[0]))
                data = Object.fromEntries(entries);
                categories.forEach(c => {
                    if(c.category_id == category.category_id){
                        data.category_name && (c.category_name = data.category_name);
                    }
                })
                fs.writeFile('./model/categories.json', JSON.stringify(categories), (err)=>{
                    if(err) throw err
                })
                res.writeHead(200, {"content-type": "application.json"})
                res.end(JSON.stringify({
                    msg: "category updated!"
                }))

            })
        }

        if(req_url == `/subcategories/${id}`){
            req.on('data', chunk =>{
                let exist=false;
                let data = JSON.parse(chunk);
                let entries = Object.entries(data)
                entries.forEach(el => el[0]=camelToUnderscore(el[0]))
                data = Object.fromEntries(entries);
                let exist_category=categories.find(c => c.category_id == data.category_id);
                if(!exist_category){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: `category with id:${data.category_id}, not found!`
                    }))
                }
                subCategories.forEach(s => {
                    
                    if(s.sub_category_id == id){
                        data.category_id && (s.category_id = data.category_id);
                        data.sub_category_name && (s.sub_category_name = data.sub_category_name);
                        exist = true;
                    }
                })
                if(!exist){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: `subcategory with id:${id}, not found!`
                    }))
                }
                fs.writeFile('./model/subCategories.json', JSON.stringify(subCategories), (err)=>{
                    if(err) throw err
                })
                res.writeHead(200, {"content-type": "application.json"})
                res.end(JSON.stringify({
                    msg: "subcategory updated!"
                }))

            })
        }

        if(req_url==`/products/${id}`){
            req.on('data', (chunk)=>{
                let exist=false;
                let data = JSON.parse(chunk);
                let entries = Object.entries(data)
                entries.forEach(el => el[0]=camelToUnderscore(el[0]))
                data = Object.fromEntries(entries);
                
                if(data.sub_category_name){
                    let exist_subCategory = subCategories.find(s => s.sub_category_name == data.sub_category_name);
                    if(!exist_subCategory){
                        res.writeHead(400, {"content-type": "application.json"})
                        return res.end(JSON.stringify({
                            msg: `subcategory with name:${data.sub_category_name}, not found!`
                        }))
                    }
                }
                    
                products.forEach(p => {
                    if(p.product_id == id){
                        data.sub_category_id && (p.sub_category_id = data.sub_category_id);
                        data.product_name && (p.product_name = data.product_name);
                        data.price && (p.price = data.price);
                        data.color && (p.color = data.color);
                        data.model && (p.model= data.model);
                        exist = true;
                    }
                })
                if(!exist){
                    res.writeHead(400, {"content-type": "application.json"})
                    return res.end(JSON.stringify({
                        msg: `product with id:${id}, not found!`
                    })) 
                }

                fs.writeFile('./model/products.json', JSON.stringify(products), (err)=>{
                    if(err) throw err;
                })
                res.writeHead(200, {"content-type": "application.json"})
                    res.end(JSON.stringify({
                    msg: `product updated!!!`
                })) 
            })
        }
    }
    
})


server.listen("4000", ()=>{
    console.log("Server running on port 4000 ...");
})