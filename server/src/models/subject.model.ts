import {Schema , model} from "mongoose";

const subjectSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
});

const Subject = model('Subject', subjectSchema);
export default Subject;