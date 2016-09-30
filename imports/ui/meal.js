import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { _ } from 'meteor/underscore';

import { Foods } from '../api/foods.js';

import './meal.html';

formatDate = function(date) {
  let d = date.toDateString();
  let h = date.getHours();
  let m = date.getMinutes();
  if (h > 12) {
    period = 'PM';
  } else if (h <= 12) {
    period = 'AM';
  } else {
    throw Meteor.Error("Hour value not recognized")
  }
  return d + ", " + h + ":" + m + " " + period;
};

createFoodStore = function(basket, mealFood) {
  // Args:
  //  basket:   takes a basket (FoodStore query result)
  //  mealFood: a list of food object ids
  let store = _.filter(basket, function(o) {
    return !_.contains(mealFood, o._id);
  });
  _.map(store, function(o) { return o.inBasket = true; });
  return store;
}

Template.meal.helpers({
  createDate() {
    return formatDate(this.createdAt);
  },
  mealType() {
    let m = this.mealType;
    // capitalizing the meal type
    return m.charAt(0).toUpperCase() + m.slice(1);
  },
  isEditable() {
    return FlowRouter.getRouteName() === "my-meals";
  },
  isEditing() {
    return Template.currentData()._id === Session.get("editingMeal");
  },
  addingFood() {
    console.log(Session.get("addingFood"));
    return Template.currentData()._id === Session.get("addingFood");
  },
  myFoods() {
    return createFoodStore(
      Foods.find({}).fetch(), Template.currentData().foods);
  },
})

Template.meal.events({
  'click .dropdown-menu'(event) {
    event.stopPropagation();
  },
  'click .edit-button'(event, instance) {
    Session.set("editingMeal", instance.data._id);
    Session.set("addingFood", instance.data._id);
  },
  'click .save-button'(event, instance) {
    event.preventDefault();
    const basket = Session.get("foodsEaten");
    const mealId = Session.get("editingMeal");

    if (basket.length === 0) {
      console.log("You must check off at least one food!");
    } else {
      Meteor.call("meals.update", mealId, basket);
      // reset the form
      Session.set("foodsEaten", []);
      instance.$(".meal-type-input").each(function(index) {
        $(this).removeClass("active");
      });
    }

    // Session.set("editingMeal", null);
    // Session.set("addingFood", null);
    // Session.set('foodsEaten', eaten);
  },
  'click .cancel-button'(event, instance) {
    Session.set("editingMeal", null);
    Session.set("addingFood", null);
  }
});
