# Games And Technology

GAT is a medium that provides information about games and technology

## Install dependencies and devDependencies

After clone or pull don't forget to install dependencies and devDependencies with:

```
npm install
npm run client-install // for install dependencies and devDependencies in client
```

## Routes for API
* /api/accounts/all
    * type : GET
    * desc : Get all member accounts
    * access : Public
* /api/accounts/register
    * type : POST
    * desc : Create an member account
    * access : Public
* /api/accounts/login
    * type : POST
    * desc : Login an member account
    * access : Public
* /api/accounts/profile/:nickname
    * type : GET
    * desc : Get current account Member
    * access : Private
* /api/accounts/profile/update/:nickname
    * type : PUT
    * desc : Update current account member
    * access : Private
* /api/accounts/profile/delete/:nickname
    * type : DELETE
    * desc : Delete an member account
    * access : Private
---
* /api/admin/all
    * type : GET
    * desc : Get all account admin
    * access : Public
* /api/admin/login
    * type : POST
    * desc : Login an account admin
    * access : Public
* /api/admin/register
    * type : POST
    * desc : Create an account admin
    * access : Private
* /api/admin/profile/:nickname
    * type : GET
    * desc : Get account admin
    * access : Public
* /api/admin/profile/update/:nickname
    * type : PUT
    * desc : Update current account admin
    * access : Private
* /api/admin/profile/delete/:nickname
    * type : DELETE
    * desc : Delete an account admin
    * access : Private
* /api/admin/roles/all
    * type : GET
    * desc : Get all roles
    * access : Private
* /api/admin/roles/add
    * type : POST
    * desc : Add an role
    * access : Private
* /api/admin/roles/edit/:id
    * type : PUT
    * desc : Edit an role
    * access : Private
* /api/admin/roles/delete/:id
    * type : DELETE
    * desc : Delete an role
    * access : Private
* /api/admin/contents/all
    * type : GET
    * desc : Get all contents
    * access : Public
* /api/admin/contents/:slug
    * type : GET
    * desc : Get content by slug
    * access : Public
* /api/admin/contents/create
    * type : POST
    * desc : Create a new content
    * access : Private
* /api/admin/contents/edit/:slug
    * type : PUT
    * desc : Edit a content
    * access : Private
* /api/admin/contents/delete/:slug
    * type : DELETE
    * desc : Delete a content
    * access : Private
* /api/admin/contents/like/:slug
    * type : POST
    * desc : Like a content
    * access : Private
* /api/admin/contents/unlike/:slug
    * type : POST
    * desc : Unlike a content
    * access : Private
* /api/admin/contents/comment/:slug
    * type : POST
    * desc : Comment a content
    * access : Private
* /api/admin/contents/comment/:slug/delete/:comment_id
    * type : POST
    * desc : Delete comment from content
    * access : Private