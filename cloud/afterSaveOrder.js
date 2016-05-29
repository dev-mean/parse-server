var _ = require('underscore');
function Proccess(orderObj,ChargesResponse,response)
{

		 var OrderItems=orderObj.get("OrderItems");//getting ordered items
	var html='<h2>Order Info:</h2><br>';
			html=html+'<table><tr><td>Quantity</td><td>Title</td><td>Price</td><td>Amount</td></tr>';
			var priceTotal=0.0;
			var amountTotal=0.0;
			    for(var i=0;i<OrderItems.length;i++)
					{
						var item=OrderItems[i];
						html=html+'<tr><td>'+item.purchaseQuantity+'</td><td>'+item.title+'</td><td>'+item.price+'</td><td>'+item.price*item.purchaseQuantity+'</td></tr>';
						priceTotal=priceTotal+item.price;
						amountTotal=amountTotal+item.price*item.purchaseQuantity;
					}
			html=html+'<tr><td></td><td>Total : </td><td>'+priceTotal+'</td><td>'+amountTotal+'</td></tr>';
			html=html+'</table>';
			html=html+'<br>Tax : '+orderObj.get("TaxAmount")+'<br>Discount : '+orderObj.get("DiscountAmount")+'<br>Paid Amount : '	+orderObj.get("TotalAmount");

	 				var chargesResponse=new Parse.Object();
					 chargesResponse=ChargesResponse;
					 var PaymentHistory = Parse.Object.extend("PaymentHistory");
					 var myPaymentHistory = new PaymentHistory();
					 myPaymentHistory.set("OrderID",orderObj.id);
					 myPaymentHistory.set("ChargesResponse",chargesResponse);//payment response from stripe store in paymentHistory
					 myPaymentHistory.save(null,
					 {
						success:function (successPaymentHistory)
						 {
							 console.log("successPaymentHistory");
							 console.log("Purchase made!");
							 console.log(ChargesResponse); 
							 var Mailgun = require('mailgun');
							 Mailgun.initialize('sandbox82443.mailgun.org', 'key-2-ekaeg6843ltjanh9tavhfilzha2rg1');//initialize mailgun
							 var Users = Parse.Object.extend("_User");
							 var Employee = new Parse.Query(Users);
									 Employee.get(orderObj.get("EmployeeID"),//Getting Employee
									 {
								 success:function (successEmployee)
								 {
									 var AppUser = new Parse.Query(Users);
									 AppUser.get(orderObj.get("UserID"),//Getting App User
									 {
								 success:function (successAppUser)
								 {
											 var queryEmp = new Parse.Query(Parse.Installation);
											 queryEmp.equalTo('user_id', orderObj.get("EmployeeID"));//Push to Emp
											 Parse.Push.send(
											 {
												 where: queryEmp,
												 data: {
												 alert: "You have received new order #"+orderObj.get('OrderNumber')
												 }
											 }, 
											 {
											 success: function() 
											 {
											 	console.log('Push was successful to Employee'); // Push was successful		 
											 },
											 error: function(error) 
											 {
											 	response.error(error);
											 	console.log('Push error for Employee');// Handle error
											 }
											 });
													 var queryApp = new Parse.Query(Parse.Installation);
													 queryApp.equalTo('user_id', orderObj.get("UserID"));//Push to App User
													 Parse.Push.send(
													 {
														 where: queryApp,
														 data: {
														 alert: "Your order #"+orderObj.get('OrderNumber')+" is received & will proccess within "+orderObj.get('deliveryTime')+" minutes from now!!" 
													 }
													 }, 
													 {
														 success: function() 
														 {
														 	console.log('Push was successful to App User'); // Push was successful	
														 },
														 error: function(error) 
														 {
														 	response.error(error);
														 	console.log('Push error for App User');// Handle error
														 }
													 });
									 var msgEmp={
									 to: successEmployee.get("email"), 
									 from: "info@popii.com",
									 subject: 'New Order by POPii',
									 html: "Hi \n"+successEmployee.get("firstName")+" "+successEmployee.get("lastName")+"\n\n You have received new order #"+orderObj.get('OrderNumber') +html
									 };
									 console.log(JSON.stringify(msgEmp));
									 Mailgun.sendEmail(msgEmp, 
									 {
										 success: function(httpResponse) //Mail to Emp
										 {
											
										 	//response.success("Email sent msgEmp!");
										 },
										 error: function(httpResponse) 
										 {
											 response.error(error);
											 //response.error("Uh oh, something went wrong");
										 }
									 });

									 var msgApp={
										 to: successAppUser.get("email"), 
										 from: "info@popii.com",
										 subject: 'Your order received by POPii',
										 html: "Hi \n"+successAppUser.get("firstName")+" "+successAppUser.get("lastName")+"\n\n Your order #"+orderObj.get('OrderNumber')+" is received & will proccess within "+orderObj.get('deliveryTime')+" minutes from now!! Thanks for using POPii"  +html
										 }; 
									 console.log(JSON.stringify(msgApp));
									 Mailgun.sendEmail(msgApp, 
										 {
											 success: function(httpResponse) //Mail to App User
												 {
												
													 //response.success("Email sent!");
												 },
											 error: function(httpResponse) 
												 {
													 response.error(error);
													 //response.error("Uh oh, something went wrong");
												 }
										 }); 
								 },
								 error:function(error)
								 {
								 response.error(error);
								 }
									 }); 
								 },
								 error:function(error)
								 {
								 	response.error(error);
								 }
									 });
									 response.success(1);
						 }, 
						error:function(error)
						 {
						 	console.log(error);
						 	response.error(error);
						 } 
					 });
}
Parse.Cloud.afterSave("Orders", function(request, response) {
	Parse.Cloud.useMasterKey();
	var orderObj=request.object;//Get Orders Object from request
	var OrderStatus = orderObj.get('OrderStatus');
 	if(OrderStatus===1)//fetch object exist in request
	{
		 
		 
		 var payMethod=orderObj.get("PaymentMethod");
		 if(payMethod==='Stripe')
		 {
			 var Stripe = require('stripe');
			 Stripe.initialize('sk_live_G66he8LxAt1U8VtwLjmJ1cVW');
			 //Stripe.initialize('sk_test_u73W3aHKcpurldoswHku9qBD');
			 //sk_live_NtAa5LQcjakmqalEovU6Mx6e
			 var paidAmount=parseFloat(orderObj.get('TotalAmount'));
			 // for(var i=0;i<OrderItems.length;i++)
			 // {
				//  var price = OrderItems[i].price;
				//  var qty = OrderItems[i].purchaseQuantity;
				//  paidAmount=paidAmount+parseFloat(price)*parseFloat(qty);//calculate total price
			 // }
			 var stripePayLoad={
				 amount: 100 * paidAmount, // $10 expressed in cents
				 currency: "usd",
				 card: orderObj.get("Token"),
				 metadata: {'order_id': orderObj.id}
				 };
			 Stripe.Charges.create(stripePayLoad,//made payment via Stripe
			 {
				 success: function(httpResponse) 
				 	{
						Proccess(orderObj,httpResponse,response);
				 	},
				 error: function(httpResponse) 
					 {
					 	 response.error(httpResponse);
						 console.log("Uh oh, something went wrong");
						 console.log(httpResponse);
					 }
			 });
		}
		else
		{
			Proccess(orderObj,orderObj.get('paymentHistory'),response);
		}
	}
	else
	{		
		Parse.Cloud.useMasterKey();
		var orderObj=request.object;//Get Orders Object from request
		var OrderStatus = orderObj.get('OrderStatus');
		var NotifyMsg='';
		if(OrderStatus===2)
			NotifyMsg='Thank you, your order is being processed';
		else if(OrderStatus===3)
			NotifyMsg='Your order is complete. Please come pick up.';
		else if(OrderStatus===4)
			NotifyMsg='Thank you for using POPii. Enjoy your food.';

		if(NotifyMsg!=='')
		{
			 var Mailgun = require('mailgun');
			 Mailgun.initialize('sandbox82443.mailgun.org', 'key-2-ekaeg6843ltjanh9tavhfilzha2rg1');//initialize mailgun
			 var Users = Parse.Object.extend("_User");
			 var AppUser = new Parse.Query(Users);
			 AppUser.get(orderObj.get("UserID"),//Getting App User
			 {
				 success:function (successAppUser)
				 {
					var msgApp={
						 to: successAppUser.get("email"), 
						 from: "info@popii.com",
						 subject: NotifyMsg,
						 html: "Hi \n"+successAppUser.get("firstName")+" "+successAppUser.get("lastName")+"\n\n "+NotifyMsg+"\n\n Thanks for using POPii"
						};
					 Mailgun.sendEmail(msgApp, 
						{
							 success: function(httpResponse) //Mail to App User
								 {
									 
									 //response.success("Email sent!");
								 },
							 error: function(httpResponse) 
								 {
									 console.error(httpResponse);
									 //response.error("Uh oh, something went wrong");
								 }
						});
				 	var queryApp = new Parse.Query(Parse.Installation);
					 queryApp.equalTo('user_id', orderObj.get("UserID"));//Push to App User
					 Parse.Push.send(
						 {
							 where: queryApp,
							 data: {
									 alert: NotifyMsg
								 }
						 }, 
						 {
						 success: function() 
						 {
						 	console.log('Push was successful to App User'); // Push was successful	
						 },
						 error: function(error) 
						 {
						 	console.log('Push error for App User');// Handle error
						 }
						 });
					},
					 error:function(error)
					{
					 	console.log(error);
					}
		 	});
		}
		
 }
});
 