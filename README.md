# How to use :
* Download the files 
* Run **npm install** to install all dependencies 

## Before using and exploring all the core features of this small web application :
#### Make sure to  set all environment variables :
##### the easiest way is as follow:
   * ### Database **MongoDB**: 
    * got to MongoDb official website **[MongoDB](https://www.mongodb.com/)** and create a free MongoDB Atlas account. 
    * And then make sure to create a user in Database Access and add your IP address (in Network access). 
    * After that go to clusters, click connect select **Connect your application**, copy the **connection string**, and make sure to replace **username**  **password** with your credentials from your user created in the second step.
    * finally go in the app.js located in the root folder (line number 22) paste that Connection string to the variable MONGODB_URI as value
    
   * ### MailingSystem **SendGrid**:
    * Create a Sengrid account at [Sendgrid](sendgrid.com) and crate an ApiKey in settings .
    * paste that Api Key into **auth.js**  ocated in the **controllers** folder controllers (line number 11)
   
   * ### Payment integration **Stripe**:
    * create a stripe account at[Stripe](stripe.com) and make sure to add your name at the left corner of the home page
    * Copy Api test key  from the home page and paste in shop.js located in the **controllers** folder (line number 7)
    
    
    
# [LinkedIn](https://pl.linkedin.com/in/peter-bilolo-badibake-a5bb26189)

## JavaScript Next generation syntax

   