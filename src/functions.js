let fs = require('fs')

let categories=JSON.parse(fs.readFileSync('./model/categories.json'));
let subCategories=JSON.parse(fs.readFileSync('./model/subCategories.json'));
let products = JSON.parse(fs.readFileSync('./model/products.json'));

let for_product = [];
function get_categories(req, res, queries){
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
    if(!queries){
        res.writeHead(200, {"content-type": "application.json"});
        return res.end(JSON.stringify(cat));
    }
    else{
        return cat;
    }
}

function get_categories_by_id(req, res, id){
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
        if (cat.length == 0){
            res.writeHead(400, {"content-type": "application.json"});
            return res.end(JSON.stringify({
                status: "fail",
                msg: "ID not found"
            }));
        }
        res.writeHead(200, {"content-type": "application.json"});
        return res.end(JSON.stringify(cat));
}

function get_subCategories(req, res){
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

function get_subCategories_by_id(req, res, id){
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
    if(subCat.length == 0){
        res.writeHead(400, {"content-type": "application.json"})
        return res.end(JSON.stringify({
            status: 'fail',
            msg: "ID not found"
        }))
    }
    res.writeHead(200, {"content-type": "application.json"});
    return res.end(JSON.stringify(subCat));
}

function get_products_by_id(req, res, id){
    let product = products.find(p => p.product_id == id)
    if(!product){
        res.writeHead(400, {"content-type": "application.json"})
        return res.end(JSON.stringify({
            status: 'fail',
            msg: "ID not found"
        }))
    }
    res.writeHead(200, {"content-type": "application.json"})
    return res.end(JSON.stringify(product))
}

function add_category_id_products(req, res){
    products.map(p =>{
        
    })
    if(!product){
        res.writeHead(400, {"content-type": "application.json"})
        return res.end(JSON.stringify({
            status: 'fail',
            msg: "ID not found"
        }))
    }
    res.writeHead(200, {"content-type": "application.json"})
    return res.end(JSON.stringify(product))
}


function get_subCategories_by_category_id(req, res, category_id, queries){
    let subCat=[];  
    subCategories.forEach(s => {
        if(s.category_id == category_id){
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
    if(!queries){
        if(subCat.length == 0){
            res.writeHead(400, {"content-type": "application.json"})
            return res.end(JSON.stringify({
                status: 'fail',
                msg: "ID not found"
            }))
        }
        res.writeHead(200, {"content-type": "application.json"});
        return res.end(JSON.stringify(subCat));
    }
    else{
        return subCat
    }
}



function camelToUnderscore(key) {
    var result = key.replace( /([A-Z])/g, " $1" );
    return result.split(' ').join('_').toLowerCase();
 }



function filter_products(queries, queries_keys, req, res){
    let filtered_products=[];
    if(queries_keys.includes('categoryId')){
        queries.forEach(q => {
            if(q[0]=='categoryId'){
                let subCat=get_subCategories_by_category_id(req, res, q[1], queries.length);
                subCat.forEach(c => filtered_products.push(...c.products));
            }
        })
        queries.forEach(q => {
            if(q[0] != "categoryId"){
                let filter = camelToUnderscore(q[0])
                for(let i=0; i<filtered_products.length; ){ 
                    if(filtered_products[i][`${filter}`]!=q[1]){
                        filtered_products.splice(i, 1);
                    }else{
                        i++
                    }
                }
            }
        })           
    }

    if(!queries_keys.includes('categoryId')){
        filtered_products=[...products];
        queries.forEach(q => {
            if(q[0] != "categoryId"){
                let filter = camelToUnderscore(q[0])
                for(let i=0; i<filtered_products.length; ){ 
                    if(filtered_products[i][`${filter}`]!=q[1]){
                        filtered_products.splice(i, 1);
                    }else{
                        i++
                    }
                }
            }
        })
    }

    return filtered_products
}


module.exports={get_categories, get_categories_by_id, get_subCategories, get_subCategories_by_id, get_products_by_id, get_subCategories_by_category_id, camelToUnderscore, filter_products};