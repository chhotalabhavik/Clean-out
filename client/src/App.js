import "./App.css";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import store from "./redux/store";
import { Provider } from "react-redux";

import Home from "./components/Home";
import Cart from "./components/Cart";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AddItem from "./components/AddItem";
import ViewItem from "./components/ViewItem";
import Register from "./components/Register";
import ItemStore from "./components/ItemStore";
import AddWorker from "./components/AddWorker";
import UpdateItem from "./components/UpdateItem";
import AddService from "./components/AddService";
import ViewWorker from "./components/ViewWorker";
import AdminRoute from "./components/AdminRoute";
import ViewService from "./components/ViewService";
import ViewProfile from "./components/ViewProfile";
import PrivateRoute from "./components/PrivateRoute";
import ViewAllItems from "./components/ViewAllItems";
import ServiceStore from "./components/ServiceStore";
import UpdateProfile from "./components/UpdateProfile";
import UpdateService from "./components/UpdateService";
import ViewItemOrder from "./components/ViewItemOrder";
import ForgotPassword from "./components/ForgotPassword";
import ViewAllWorkers from "./components/ViewAllWorkers";
import ViewAllServices from "./components/ViewAllServices";
import ViewServiceOrder from "./components/ViewServiceOrder";
import ViewWorkerService from "./components/ViewWorkerService";
import ViewAllRequestedOrders from "./components/ViewAllRequestedOrders";

import Admin from "./components/Admin/Admin";
import AdminCart from "./components/Admin/Cart";
import AdminAddItem from "./components/Admin/AddItem";
import AdminAddWorker from "./components/Admin/AddWorker";
import AdminAddService from "./components/Admin/AddService";
import AdminViewProfile from "./components/Admin/ViewProfile";
import AdminViewService from "./components/Admin/ViewService";
import AdminViewAllItems from "./components/Admin/ViewAllItems";
import AdminUpdateService from "./components/Admin/UpdateService";
import AdminUpdateProfile from "./components/Admin/UpdateProfile";
import AdminViewItemOrder from "./components/Admin/ViewItemOrder";
import AdminViewAllWorkers from "./components/Admin/ViewAllWorkers";
import AdminViewAllServices from "./components/Admin/ViewAllServices";
import AdminViewServiceOrder from "./components/Admin/ViewServiceOrder";
import AdminServiceCategories from "./components/Admin/ServiceCategories";
import AdminAddServiceCategory from "./components/Admin/AddServiceCategory";
import AdminViewServiceCategory from "./components/Admin/ViewServiceCategory";
import AdminUpdateServiceCategory from "./components/Admin/UpdateServiceCategory";
import AdminViewAllRequestedOrders from "./components/Admin/ViewAllRequestedOrders";

import { setUserFromStorage } from "./redux/actions";

function App() {
	setUserFromStorage(store);

	return (
		<Provider store={store}>
			<Router>
				<Header />
				<Route path="/" exact component={Home} />
				<Route path="/login" exact component={Login} />
				<Route path="/logout" exact component={Logout} />
				<Route path="/register" exact component={Register} />
				<Route path="/store/items" exact component={ItemStore} />
				<Route path="/viewItem/:itemId" exact component={ViewItem} />
				<Route path="/store/services" exact component={ServiceStore} />
				<Route path="/forgotPassword" exact component={ForgotPassword} />
				<Route
					path="/viewWorkerService/:workerServiceId"
					exact
					component={ViewWorkerService}
				/>

				<Switch>
					<PrivateRoute path="/cart" exact component={Cart} />
					<PrivateRoute path="/addItem" exact component={AddItem} />
					<PrivateRoute path="/addWorker" exact component={AddWorker} />
					<PrivateRoute path="/addService" exact component={AddService} />
					<PrivateRoute path="/viewProfile" exact component={ViewProfile} />
					<PrivateRoute path="/viewAllItems" exact component={ViewAllItems} />
					<PrivateRoute path="/updateProfile" exact component={UpdateProfile} />
					<PrivateRoute path="/viewAllWorkers" exact component={ViewAllWorkers} />
					<PrivateRoute path="/updateItem/:itemId" exact component={UpdateItem} />
					<PrivateRoute path="/viewWorker/:workerId" exact component={ViewWorker} />
					<PrivateRoute path="/viewAllServices" exact component={ViewAllServices} />
					<PrivateRoute path="/viewService/:serviceId" exact component={ViewService} />
					<PrivateRoute
						path="/viewItemOrder/:itemOrderId"
						exact
						component={ViewItemOrder}
					/>
					<PrivateRoute
						path="/viewServiceOrder/:serviceOrderId"
						exact
						component={ViewServiceOrder}
					/>
					<PrivateRoute
						path="/viewAllRequestedOrders"
						exact
						component={ViewAllRequestedOrders}
					/>
					<PrivateRoute
						path="/updateService/:serviceId"
						exact
						component={UpdateService}
					/>
				</Switch>

				<Switch>
					<AdminRoute path="/admin" exact component={Admin} />
					<AdminRoute path="/admin/cart/:userId" exact component={AdminCart} />
					<AdminRoute path="/admin/addItem/:userId" exact component={AdminAddItem} />
					<AdminRoute path="/admin/addWorker/:userId" exact component={AdminAddWorker} />
					<AdminRoute
						path="/admin/addServiceCategory"
						exact
						component={AdminAddServiceCategory}
					/>
					<AdminRoute
						path="/admin/viewServiceCategory/:serviceCategoryId"
						exact
						component={AdminViewServiceCategory}
					/>
					<AdminRoute
						path="/admin/updateServiceCategory/:serviceCategoryId"
						exact
						component={AdminUpdateServiceCategory}
					/>
					<AdminRoute
						path="/admin/serviceCategories"
						exact
						component={AdminServiceCategories}
					/>
					<AdminRoute
						path="/admin/viewService/:serviceId"
						exact
						component={AdminViewService}
					/>
					<AdminRoute
						path="/admin/updateService/:serviceId"
						exact
						component={AdminUpdateService}
					/>
					<AdminRoute
						path="/admin/addService/:userId"
						exact
						component={AdminAddService}
					/>
					<AdminRoute
						path="/admin/viewProfile/:userId"
						exact
						component={AdminViewProfile}
					/>
					<AdminRoute
						path="/admin/viewItemOrder/:itemOrderId"
						exact
						component={AdminViewItemOrder}
					/>
					<AdminRoute
						path="/admin/viewServiceOrder/:serviceOrderId"
						exact
						component={AdminViewServiceOrder}
					/>
					<AdminRoute
						path="/admin/updateProfile/:userId"
						exact
						component={AdminUpdateProfile}
					/>
					<AdminRoute
						path="/admin/viewAllItems/:userId"
						exact
						component={AdminViewAllItems}
					/>
					<AdminRoute
						path="/admin/viewAllWorkers/:userId"
						exact
						component={AdminViewAllWorkers}
					/>
					<AdminRoute
						path="/admin/viewAllServices/:userId"
						exact
						component={AdminViewAllServices}
					/>
					<AdminRoute
						path="/admin/viewAllRequestedOrders/:userId"
						exact
						component={AdminViewAllRequestedOrders}
					/>
				</Switch>

				<Footer />
			</Router>
		</Provider>
	);
}

export default App;
