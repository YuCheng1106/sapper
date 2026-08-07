import React, { useState } from 'react';

const Form = () => {
  const [fields, setFields] = useState([{ id: 1, value: '' }]);

  const handleAddField = () => {
    const newField = { id: Date.now(), value: '' };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (id) => {
    const updatedFields = fields.filter((field) => field.id !== id);
    setFields(updatedFields);
  };

  const handleFieldChange = (id, value) => {
    const updatedFields = fields.map((field) => {
      if (field.id === id) {
        return { ...field, value };
      }
      return field;
    });
    setFields(updatedFields);
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    const sourceIndex = fields.findIndex((field) => field.id === Number(sourceId));
    const targetIndex = fields.findIndex((field) => field.id === Number(targetId));
    const updatedFields = [...fields];
    const [removedField] = updatedFields.splice(sourceIndex, 1);
    updatedFields.splice(targetIndex, 0, removedField);
    setFields(updatedFields);
  };

  return (
    <div className="container">
      <div className="row">
        {fields.map((field) => (
          <React.Fragment key={field.id}>
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, field.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, field.id)}
              className="col-md-10 form-group"
            >
              <input
                type="text"
                value={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <button
                onClick={() => handleRemoveField(field.id)}
                className="btn btn-danger mt-2"
              >
                Remove
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>
      <button onClick={handleAddField} className="btn btn-primary mt-3">
        Add Field
      </button>
    </div>
  );
};

export default Form;
