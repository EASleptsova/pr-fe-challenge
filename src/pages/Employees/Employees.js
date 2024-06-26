import React, { useState } from "react";
import EmployeeForm from "./EmployeeForm";
import PageHeader from "../../components/PageHeader";
import PeopleOutlineTwoToneIcon from "@material-ui/icons/PeopleOutlineTwoTone";
import {
  Paper,
  makeStyles,
  TableBody,
  TableRow,
  TableCell,
  Toolbar,
  InputAdornment,
} from "@material-ui/core";
import useTable from "../../components/useTable";
import * as employeeService from "../../services/employeeService";
import Controls from "../../components/controls/Controls";
import { Search } from "@material-ui/icons";
import AddIcon from "@material-ui/icons/Add";
import Popup from "../../components/Popup";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import CloseIcon from "@material-ui/icons/Close";
import Notification from "../../components/Notification";
import ConfirmDialog from "../../components/ConfirmDialog";

const useStyles = makeStyles((theme) => ({
  pageContent: {
    margin: theme.spacing(5),
    padding: theme.spacing(3),
  },
  searchInput: {
    width: "75%",
  },
  newButton: {
    position: "absolute",
    right: "10px",
  },
  toolbar: {
    display: "flex",
    gap: "10px",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
  },
  dropdownInput: {
    width: "200px",
  },
}));

const headCells = [
  { id: "fullName", label: "Employee Name" },
  { id: "email", label: "Email Address (Personal)" },
  { id: "mobile", label: "Mobile Number" },
  { id: "department", label: "Department" },
  { id: "actions", label: "Actions", disableSorting: true },
];

export default function Employees() {
  const classes = useStyles();
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [departmentValue, setDepartmentValue] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [records, setRecords] = useState(employeeService.getAllEmployees());
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });
  const [openPopup, setOpenPopup] = useState(false);
  const [notify, setNotify] = useState({
    isOpen: false,
    message: "",
    type: "",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    subTitle: "",
  });

  const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } =
    useTable(records, headCells, filterFn);

  const handleSearch = (e) => {
    let target = e.target;
    setFilterFn({
      fn: (items) => {
        if (target.value === "") return items;
        else
          return items.filter((x) =>
            x.fullName.toLowerCase().includes(target.value.toLowerCase())
          );
      },
    });
  };

  const handleSearchByDepartment = (e) => {
    let target = e.target;
    setDepartmentValue(target.value);
    setFilterFn({
      fn: (items) => {
        if (target.value === "") return items;
        else return items.filter((x) => x.departmentId === target.value);
      },
    });
  };

  const handleSelectEmployee = (id) => {
    if (selectedEmployees.find((item) => item === id)) {
      setSelectedEmployees(selectedEmployees.filter((item) => item !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  const addOrEdit = (employee, resetForm) => {
    if (employee.id === 0) employeeService.insertEmployee(employee);
    else employeeService.updateEmployee(employee);
    resetForm();
    setRecordForEdit(null);
    setOpenPopup(false);
    setRecords(employeeService.getAllEmployees());
    setNotify({
      isOpen: true,
      message: "Submitted Successfully",
      type: "success",
    });
  };

  const openInPopup = (item) => {
    setRecordForEdit(item);
    setOpenPopup(true);
  };

  const onDelete = (ids) => {
    setConfirmDialog({
      ...confirmDialog,
      isOpen: false,
    });
    employeeService.deleteEmployees(ids);
    setRecords(employeeService.getAllEmployees());
    setSelectedEmployees([]);
    setNotify({
      isOpen: true,
      message: "Deleted Successfully",
      type: "error",
    });
  };

  return (
    <>
      <PageHeader
        title="New Employee"
        subTitle="Form design with validation"
        icon={<PeopleOutlineTwoToneIcon fontSize="large" />}
      />
      <Paper className={classes.pageContent}>
        <Toolbar className={classes.toolbar}>
          <Controls.Input
            label="Search Employees"
            className={classes.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            onChange={handleSearch}
          />
          <Controls.Button
            text="Add New"
            variant="outlined"
            startIcon={<AddIcon />}
            className={classes.newButton}
            onClick={() => {
              setOpenPopup(true);
              setRecordForEdit(null);
            }}
          />

          <Controls.Select
            name="departmentId"
            label="Department"
            className={classes.dropdownInput}
            value={departmentValue}
            onChange={handleSearchByDepartment}
            options={employeeService
              .getDepartmentCollection()
              .map((item) => ({ id: item.id, title: item.name }))}
          />
        </Toolbar>

        <TblContainer>
          <TblHead />
          <TableBody>
            {recordsAfterPagingAndSorting().map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.fullName}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.mobile}</TableCell>
                <TableCell>{item.department}</TableCell>
                <TableCell>
                  <Controls.ActionButton
                    color="primary"
                    onClick={() => {
                      openInPopup(item);
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </Controls.ActionButton>
                  <Controls.ActionButton
                    color="secondary"
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title:
                          "Are you sure you want to delete this record(s)?",
                        subTitle: "You can't undo this operation",
                        onConfirm: () => {
                          onDelete(
                            selectedEmployees.length > 0
                              ? selectedEmployees
                              : [item.id]
                          );
                        },
                      });
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </Controls.ActionButton>

                  <Controls.Checkbox
                    name="select-employee"
                    label="Select Employee"
                    value={!!selectedEmployees.find((id) => id === item.id)}
                    inputProps={{ "aria-label": "controlled" }}
                    onChange={() => handleSelectEmployee(item.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TblContainer>
        <TblPagination />
      </Paper>
      <Popup
        title="Employee Form"
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <EmployeeForm recordForEdit={recordForEdit} addOrEdit={addOrEdit} />
      </Popup>
      <Notification notify={notify} setNotify={setNotify} />
      <ConfirmDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </>
  );
}
