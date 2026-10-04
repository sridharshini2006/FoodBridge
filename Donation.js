class Donation {
    constructor(
        id,
        donorName,
        foodType,
        quantity,
        location,
        availableFrom,
        availableTo,
        notes,
        status,
        requestedBy,
        volunteer
    ) {
        this.id = id;
        this.donorName = donorName;
        this.foodType = foodType;
        this.quantity = quantity;
        this.location = location;
        this.availableFrom = availableFrom;
        this.availableTo = availableTo;
        this.notes = notes;
        this.status = status;
        this.requestedBy = requestedBy;
        this.volunteer = volunteer;
    }
}

module.exports = Donation;