let fs = require('fs')

let categories=JSON.parse(fs.readFileSync('./model/categories.json'));
let subCategories=JSON.parse(fs.readFileSync('./model/subCategories.json'));
let products = JSON.parse(fs.readFileSync('./model/products.json'));

function get_categories(req, res){
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


module.exports={get_categories, get_categories_by_id, get_subCategories, get_subCategories_by_id, get_products_by_id};