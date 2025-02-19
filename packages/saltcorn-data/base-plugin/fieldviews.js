/**
 * @category saltcorn-data
 * @module base-plugin/fieldviews
 * @subcategory base-plugin
 */

const View = require("../models/view");
const Table = require("../models/table");
const {
  option,
  a,
  h5,
  span,
  text_attr,
  script,
  input,
} = require("@saltcorn/markup/tags");
const tags = require("@saltcorn/markup/tags");
const { select_options, radio_group } = require("@saltcorn/markup/helpers");

/**
 * select namespace
 * @namespace
 * @category saltcorn-data
 */
const select = {
  /** @type {string} */
  type: "Key",
  /** @type {boolean} */
  isEdit: true,
  /**
   * @type {object[]}
   */
  configFields: () => [
    {
      name: "neutral_label",
      label: "Neutral label",
      type: "String",
    },
    {
      name: "where",
      label: "Where",
      type: "String",
    },
    {
      name: "force_required",
      label: "Force required",
      sublabel:
        "User must select a value, even if the table field is not required",
      type: "Bool",
    },
  ],

  /**
   * @param {*} nm
   * @param {*} v
   * @param {*} attrs
   * @param {*} cls
   * @param {*} reqd
   * @param {*} field
   * @returns {object}
   */
  run: (nm, v, attrs, cls, reqd, field) => {
    if (attrs.disabled)
      return (
        input({
          class: `${cls} ${field.class || ""}`,
          "data-fieldname": field.form_name,
          name: text_attr(nm),
          id: `input${text_attr(nm)}`,
          readonly: true,
          placeholder: v || field.label,
        }) + span({ class: "ml-m1" }, "v")
      );
    return tags.select(
      {
        class: `form-control ${cls} ${field.class || ""}`,
        "data-fieldname": field.form_name,
        name: text_attr(nm),
        id: `input${text_attr(nm)}`,
      },
      select_options(
        v,
        field,
        (attrs || {}).force_required,
        (attrs || {}).neutral_label
      )
    );
  },
};

/**
 * radio_select namespace
 * @namespace
 * @category saltcorn-data
 */
const radio_select = {
  /** @type {string} */
  type: "Key",
  /** @type {boolean} */
  isEdit: true,
  /**
   * @param {*} nm
   * @param {*} v
   * @param {*} attrs
   * @param {*} cls
   * @param {*} reqd
   * @param {*} field
   * @returns {object}
   */
  run: (nm, v, attrs, cls, reqd, field) =>
    radio_group({
      class: `${cls} ${field.class || ""}`,
      name: text_attr(nm),
      options: field.options,
      value: v,
    }),
};

/**
 * select namespace
 * @namespace
 * @category saltcorn-data
 */
const search_or_create = {
  /** @type {string} */
  type: "Key",
  /** @type {boolean} */
  isEdit: true,
  /**
   * @param {object} field
   * @returns {Promise<object[]>}
   */
  configFields: async (field) => {
    const reftable = await Table.findOne({ name: field.reftable_name });
    const views = await View.find({ table_id: reftable.id });
    return [
      {
        name: "viewname",
        label: "View to create",
        input_type: "select",
        form_name: field.form_name,
        options: views.map((v) => v.name),
      },
      {
        name: "label",
        label: "Label to create",
        type: "String",
      },
    ];
  },

  /**
   * @param {*} nm
   * @param {*} v
   * @param {*} attrs
   * @param {*} cls
   * @param {*} reqd
   * @param {*} field
   * @returns {object}
   */
  run: (nm, v, attrs, cls, reqd, field) => {
    return (
      tags.select(
        {
          class: `form-control ${cls} ${field.class || ""}`,
          name: text_attr(nm),
          id: `input${text_attr(nm)}`,
        },
        select_options(v, field)
      ) +
      a(
        {
          href: `javascript:ajax_modal('/view/${attrs.viewname}',{submitReload: false,onClose: soc_process_${nm}})`,
        },
        attrs.label || "Or create new"
      ) +
      script(`
      function soc_process_${nm}(){
        $.ajax('/api/${field.reftable_name}', {
          success: function (res, textStatus, request) {
            var opts = res.success.map(x=>'<option value="'+x.id+'">'+x.${
              attrs.summary_field
            }+'</option>').join("")
            ${reqd ? "" : `opts = '<option></option>'+opts`}
            $('#input${text_attr(
              nm
            )}').html(opts).prop('selectedIndex', res.success.length${
        reqd ? "-1" : ""
      }); 
          }
        })
      }`)
    );
  },
};
module.exports = { select, search_or_create, radio_select };
