import Time "mo:core/Time";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Order "mo:core/Order";
import OutCall "http-outcalls/outcall";

actor {
  type BookPlan = {
    id : Nat;
    timestamp : Time.Time;
    bookName : Text;
    bookType : Text;
    dailyReadingHours : Nat;
    generatedPlan : Text;
  };

  module BookPlan {
    public func compareByTimestamp(plan1 : BookPlan, plan2 : BookPlan) : Order.Order {
      Int.compare(plan1.timestamp, plan2.timestamp);
    };

    public func compareByBookName(plan1 : BookPlan, plan2 : BookPlan) : Order.Order {
      switch (Nat.compare(plan1.id, plan2.id)) {
        case (#equal) { Text.compare(plan1.bookName, plan2.bookName) };
        case (order) { order };
      };
    };
  };

  let plans = Map.empty<Nat, BookPlan>();
  var nextId = 0;

  // Required shared query transform for HTTP outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // URL-encode a book title for use in API calls
  func urlEncode(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      if (c == ' ') {
        result := result # "+";
      } else {
        result := result # Text.fromChar(c);
      };
    };
    result;
  };

  // Fetch real chapter/TOC data for a book from Open Library works API.
  // Searches for the book, then fetches the work record which may include table_of_contents.
  public func fetchBookChapters(bookName : Text) : async Text {
    let encoded = urlEncode(bookName);
    // Use the works search which returns richer data including table_of_contents when available
    let searchUrl = "https://openlibrary.org/search.json?title=" # encoded # "&limit=1&fields=key,title,table_of_contents,subject";

    try {
      let body = await OutCall.httpGetRequest(
        searchUrl,
        [],
        transform,
      );
      body;
    } catch (_) {
      "{}";
    };
  };

  public shared ({ caller }) func createBookPlan(bookName : Text, bookType : Text, dailyReadingHours : Nat, generatedPlan : Text) : async Nat {
    let id = nextId;
    nextId += 1;
    let newPlan : BookPlan = {
      id;
      timestamp = Time.now();
      bookName;
      bookType;
      dailyReadingHours;
      generatedPlan;
    };
    plans.add(id, newPlan);
    id;
  };

  public query ({ caller }) func getAllPlans() : async [BookPlan] {
    plans.values().toArray();
  };

  public query ({ caller }) func getPlan(id : Nat) : async BookPlan {
    switch (plans.get(id)) {
      case (null) { Runtime.trap("Plan not found") };
      case (?plan) { plan };
    };
  };

  public shared ({ caller }) func deletePlan(id : Nat) : async () {
    if (not plans.containsKey(id)) {
      Runtime.trap("Plan not found");
    };
    plans.remove(id);
  };
};
