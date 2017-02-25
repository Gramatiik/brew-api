---
# Introduction

## Field Selection

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

## Recursivity

Linked modeles can be fetched through a single endpoint to avoid multiple calls to the API.
By default linked models are included in the response but you can tell the API not to fetch them if you don't need them.

Use the **recursivity** parameter to get linked models or not, it takes a boolean.

i.e. `/breweries?recursivity=false` if you don't want associated beers and brewery geoposition.

For the moment you cannot select which associated model you want to get.

## Ordering

Endpoints with an array root element can be ordered.

To enable ordering, use the **order** query parameter, with this form `field:type`.

i.e. To get a list of beers in decreasing order of IBU you would simply write this : `/beers?order=ibu:desc`

## Misc

1. Every _POST_ and _PUT_ parameters are passed into body request.
