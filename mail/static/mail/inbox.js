document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

document.querySelector('form').onsubmit = function (e) {
  e.preventDefault();
  let tempR = document.getElementById('compose-recipients').value;
  let tempS = document.getElementById('compose-subject').value;
  let tempB = document.getElementById('compose-body').value;

  fetch('/emails', {
    method: 'POST',
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      'Content-Type': 'application/json',
    },
    csrfmiddlewaretoken: '{{ csrf_token }}',
    body: JSON.stringify({
      recipients: tempR,
      subject: tempS,
      body: tempB,
    }),
  })
    .then(response => response.json())
    .then(result => console.log(result))
    .then(() => load_mailbox('sent'))
}//form.onsubmit

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}//function getCookie

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mailcontent-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}//function compose_email

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mailcontent-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mailcontent-view').innerHTML = '';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  let url = '/emails/' + mailbox;
  fetch(url)
    .then(response => response.json())
    .then(result => {

      let tbl = document.createElement('table');
      for (let i = 0; i < result.length; i++) {
        let td0 = document.createElement('td');
        td0.appendChild(document.createTextNode(result[i]["id"] + ' '));
        td0.style.display = "none";

        let td = document.createElement('td');

        td.appendChild(document.createTextNode(result[i]["sender"] + '\u00A0\u00A0'));
        td.appendChild(document.createTextNode(result[i]["subject"] + '\u00A0\u00A0'));
        td.appendChild(document.createTextNode(result[i]["tamp"] + '\u00A0\u00A0'));
        let tr = document.createElement('tr');
        tr.append(td0, td);

        let icon = document.createElement('div')
        icon.classList.add('icon');
        let tooltiptext = document.createElement('span');
        tooltiptext.classList.add('tiptext');
        icon.appendChild(tooltiptext);
        let td2 = document.createElement('td');
        td2.appendChild(icon);
        tr.appendChild(td2);


        if (mailbox == 'inbox') {

          if (result[i]["read"] == true) {
            tr.style.background = '#f0f0f0';
          }
          else{
            tr.style.fontWeight ='bold';
          }

          icon.style.backgroundImage = "url(https://cdn3.iconfinder.com/data/icons/google-material-design-icons/48/ic_archive_48px-512.png)";
          tooltiptext.innerHTML = 'Archive';

          icon.addEventListener('click', function (e) {
            e.stopPropagation();
            let url = '/emails/' + e.target.parentElement.parentElement.firstChild.innerHTML;
            fetch(url, {
              method: "PUT",
              headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "Accept": "application/json",
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                archived: true,
              }),
            })
              .then(() => load_mailbox('inbox'))
          })

        }//(mailbox=='inbox')

        if (mailbox == 'archive') {

          if (result[i]["read"] == true) {
            tr.style.background = '#f0f0f0';
          }
          else{
            tr.style.fontWeight ='bold';
          }

          icon.style.backgroundImage = "url(https://cdn3.iconfinder.com/data/icons/business-vol-19/100/Artboard_4-512.png)";
          tooltiptext.innerHTML = 'Unarchive';

          icon.addEventListener('click', function (e) {
            e.stopPropagation();
            let url = '/emails/' + e.target.parentElement.parentElement.firstChild.innerHTML;
            fetch(url, {
              method: "PUT",
              headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "Accept": "application/json",
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                archived: false,
              }),
            })
              .then(() => load_mailbox('archive'))
          })
        }//(mailbox=='archive')

        tbl.appendChild(tr);

        // $(staticAncestors).on(eventName, dynamicChild, function() {});
        // $(document).on('click','#btnPrepend',function(){//do something})
        document.querySelector('#emails-view').appendChild(tbl);
        tr.addEventListener('click', (e) => {

          // let temp=e.target.childNodes[0].nodeValue;

          // $('.myTable tr td').each(function() {

          //   //First child of td
          //   var firstChild = $(this).children(':first');
          //   alert(firstChild.text());

          // });
          view_email(e.target.parentElement.firstChild.innerHTML, mailbox);
        });

      }
    })

}//function load_mailbox


function view_email(email_id, mailbox) {
  // if(mailbox!='sent'){

  // }
  // else{
  //   data="";
  // }
  let url = '/emails/' + email_id;
  fetch(url, {
    method: 'PUT',
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      read: true,
    }),
  })
    // .then(response => response.json)
    .then(
      fetch(url)
        .then(response => response.json())
        .then(result => {
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#mailcontent-view').style.display = 'block';

          let from = document.createElement("div");
          from.innerHTML = '<b>Form: </b>' + result.sender;

          let to = document.createElement('div');
          to.innerHTML = '<b>To: </b>' + result.recipients;

          let sub = document.createElement('div');
          sub.innerHTML = '<b>Subject: </b>' + result.subject;

          let tamp = document.createElement('div');
          tamp.innerHTML = '<b>Timestamp: </b>' + result.tamp;

          let bt1 = document.createElement('button');
          bt1.classList.add('btn', 'btn-sm', 'btn-outline-primary');
          bt1.innerHTML = "Reply";

          let bt2 = document.createElement('button');
          bt2.classList.add('btn', 'btn-sm', 'btn-outline-primary');

          let content = document.createElement('div');
          content.id = "email-content";
          content.innerHTML = result.body;

          let hr1 = document.createElement('hr');
          let hr2 = document.createElement('hr');

          bt1.addEventListener('click', function () {
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'block';
            document.querySelector('#mailcontent-view').style.display = 'none';

            document.querySelector('#compose-recipients').value = result.sender;

            if (result.subject[0] + result.subject[1] + result.subject[2] == 'Re:') {
              document.querySelector('#compose-subject').value = result.subject;
            }
            else {
              document.querySelector('#compose-subject').value = 'Re: ' + result.subject;
            }
            // console.log('here');
            document.querySelector('#compose-body').innerHTML='';
            document.querySelector('#compose-body').value='\r\n' + 'On ' + result.tamp + ' ' + result.sender + ' wrote: ' + '\r\n' + result.body;
          });
          document.querySelector('#mailcontent-view').append(from, to, sub, tamp, hr1, content, hr2, bt1, " ");

          if (mailbox == 'archive') {
            bt2.innerHTML = "Unarchived";
            bt2.addEventListener('click', function (e) {
              fetch(url, {
                method: "PUT",
                headers: {
                  "X-CSRFToken": getCookie("csrftoken"),
                  "Accept": "application/json",
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  archived: false,
                }),
              })
                .then(() => load_mailbox('inbox'))
            })
            document.querySelector('#mailcontent-view').appendChild(bt2);
          }//if(mailbox=='archive')

          if (mailbox == 'inbox') {
            bt2.innerHTML = "Archived";
            bt2.addEventListener('click', function (e) {
              fetch(url, {
                method: "PUT",
                headers: {
                  "X-CSRFToken": getCookie("csrftoken"),
                  "Accept": "application/json",
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  archived: true,
                }),
              })
                .then(() => load_mailbox('inbox'))
            })
            document.querySelector('#mailcontent-view').appendChild(bt2);
          }//if(mailbox=='inbox')


        })
    )


}//function view_email

// $("#tbID").append("<tr><td class='labelTd'>文件名</td><td>对应合同</td><tr>");

//document.querySelector('#mailcontent-view').innerHTML =from.outerHTML + to.outerHTML + sub.outerHTML + tamp.outerHTML + "<hr>" + content.outerHTML + '<hr>' + bt.outerHTML;
// jQuery('#myDiv').siblings('p:first') or jQuery('#myDiv').siblings('p').first()