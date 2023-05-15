import mssql from "mssql"
export async function getNews() {
    const url ="https://newsapi.org/v2/everything?q=twitch&sortBy=popularity&language=es&apiKey=db7f3b5fb2634328a479dc671fd321bb"
    const res = await fetch (url)
    const json = await res.json()
    console.log(json)

    const result = json.articles.filter(news=>news.source.name=== "Xataka.com")
    console.log(result)

    for(let i=0; i<result.length; i++){
        const request = new mssql.Request()

        request.input("title", mssql.NVarChar, result[i].title)
        request.input("text", mssql.NVarChar, result[i].description)
        request.input("image", mssql.NVarChar, result[i].urlToImage)
        request.input("link", mssql.NVarChar, result[i].url)
    
        const dbResult = await request.query("insert into news(title, text, image, link) values(@title, @text, @image, @link); select @@identity as news_id")
        const insert = dbResult.recordset[0].news_id
        const request2 = new mssql.Request()
        request2.input("news_id", mssql.Int, insert)
        request2.input("type_id", mssql.Int, 2)
        const dbInsert = await request2.query("insert into types_news(news_id, type_id) values(@news_id, @type_id);")

        
    }
  
}
export async function getNewsSteam() {
    const url = "http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=3&format=json"
    const res = await fetch (url)
    const json = await res.json()
    console.log(json)

    const result = json.appnews.newsitems.filter(news=>news.feed_type=== 0)
    console.log(result)

    const request = new mssql.Request()
    request.input("title", mssql.NVarChar, result[0].title)
    request.input("text", mssql.NVarChar, result[0].contents)

    await request.query("insert into news(title, text) values(@title, @text)")
}
export async function getNewsLevelUpNintendo() {
    const url = "https://newsapi.org/v2/everything?q=nintendo&from=2023-05-07&to=2023-05-07&sortBy=popularity&language=es&apiKey=db7f3b5fb2634328a479dc671fd321bb"
    const res = await fetch (url)
    const json = await res.json()
    console.log(json)

    const result = json.articles.filter(news=>news.source.name=== "Levelup.com")
    console.log(result)

    for(let i=0; i<result.length; i++){
        const request = new mssql.Request()

        request.input("title", mssql.NVarChar, result[i].title)
        request.input("text", mssql.NVarChar, result[i].description)
        request.input("image", mssql.NVarChar, result[i].urlToImage)
        request.input("link", mssql.NVarChar, result[i].url)
    
        const dbResult = await request.query("insert into news(title, text, image, link) values(@title, @text, @image, @link); select @@identity as news_id")
        const insert = dbResult.recordset[0].news_id
        const request2 = new mssql.Request()
        request2.input("news_id", mssql.Int, insert)
        request2.input("type_id", mssql.Int, 2)
        const dbInsert = await request2.query("insert into types_news(news_id, type_id) values(@news_id, @type_id);")

        
    }
  
}
export async function getNewsLevelUpXataka() {
    const url = "https://newsapi.org/v2/everything?q=xbox&from=2023-05-07&to=2023-05-07&sortBy=popularity&language=es&apiKey=db7f3b5fb2634328a479dc671fd321bb"
    const res = await fetch (url)
    const json = await res.json()
    console.log(json)

    const result = json.articles.filter(news=>news.source.name=== "Xatakahome.com")
    console.log(result)

    for(let i=0; i<result.length; i++){
        const request = new mssql.Request()

        request.input("title", mssql.NVarChar, result[i].title)
        request.input("text", mssql.NVarChar, result[i].description)
        request.input("image", mssql.NVarChar, result[i].urlToImage)
        request.input("link", mssql.NVarChar, result[i].url)
    
        const dbResult = await request.query("insert into news(title, text, image, link) values(@title, @text, @image, @link); select @@identity as news_id")
        const insert = dbResult.recordset[0].news_id
        const request2 = new mssql.Request()
        request2.input("news_id", mssql.Int, insert)
        request2.input("type_id", mssql.Int, 2)
        const dbInsert = await request2.query("insert into types_news(news_id, type_id) values(@news_id, @type_id);")

        
    }
  
}
export async function getNewsLevelUpMicrosoft() {
    const url = "https://newsapi.org/v2/everything?q=nintendo&from=2023-05-07&to=2023-05-07&sortBy=popularity&language=es&apiKey=db7f3b5fb2634328a479dc671fd321bb"
    const res = await fetch (url)
    const json = await res.json()
    console.log(json)

    const result = json.articles.filter(news=>news.source.name=== "Levelup.com")
    console.log(result)

    for(let i=0; i<result.length; i++){
        const request = new mssql.Request()

        request.input("title", mssql.NVarChar, result[i].title)
        request.input("text", mssql.NVarChar, result[i].description)
        request.input("image", mssql.NVarChar, result[i].urlToImage)
        request.input("link", mssql.NVarChar, result[i].url)
    
        const dbResult = await request.query("insert into news(title, text, image, link) values(@title, @text, @image, @link); select @@identity as news_id")
        const insert = dbResult.recordset[0].news_id
        const request2 = new mssql.Request()
        request2.input("news_id", mssql.Int, insert)
        request2.input("type_id", mssql.Int, 2)
        const dbInsert = await request2.query("insert into types_news(news_id, type_id) values(@news_id, @type_id);")

        
    }
  
}
export async function getNewsLevelUpPlayStation() {
    const url = "https://newsapi.org/v2/everything?q=playstation&from=2023-05-07&to=2023-05-07&sortBy=popularity&language=es&apiKey=db7f3b5fb2634328a479dc671fd321bb"
    const res = await fetch (url)
    const json = await res.json()
    console.log(json)

    const result = json.articles.filter(news=>news.source.name=== "Levelup.com")
    console.log(result)

    for(let i=0; i<result.length; i++){
        const request = new mssql.Request()

        request.input("title", mssql.NVarChar, result[i].title)
        request.input("text", mssql.NVarChar, result[i].description)
        request.input("image", mssql.NVarChar, result[i].urlToImage)
        request.input("link", mssql.NVarChar, result[i].url)
    
        const dbResult = await request.query("insert into news(title, text, image, link) values(@title, @text, @image, @link); select @@identity as news_id")
        const insert = dbResult.recordset[0].news_id
        const request2 = new mssql.Request()
        request2.input("news_id", mssql.Int, insert)
        request2.input("type_id", mssql.Int, 2)
        const dbInsert = await request2.query("insert into types_news(news_id, type_id) values(@news_id, @type_id);")

        
    }
}