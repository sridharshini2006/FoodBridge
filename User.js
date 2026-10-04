class User {
    constructor(id, role, name, email, phone, verified) {
        this.id = id;
        this.role = role;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.verified = verified;
    }
}

module.exports = User;