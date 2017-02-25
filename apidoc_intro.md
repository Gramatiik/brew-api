---
# Introduction

## Filtering

Every endpoint of the API (except count methods) has field selection enabled,
to use field selection, set the **fields** parameter in yor query.

usage : list selected fields coma separated in the fields parameter  
i.e. For the **beers** endpoint, you can choose to ge only _id_ and _name_ like this `/beers/12?fields=id,name`.

By default you get all available fields (euqivalent of `/beers/12?fields=*`),
try to use fields selections when you can for server performance :)

## Pagination

Endpoints with an array root element are paginated,
to use pagination, set **limit** and **offset** query parameters in your request.

usage : limit and offset takes only positive numbers  
i.e. to get 5 beers starting at beer id 32 you simply do`/beers?limit=5&offset=32`.  
Every endpoint has default and maximum limits that are documented below.
