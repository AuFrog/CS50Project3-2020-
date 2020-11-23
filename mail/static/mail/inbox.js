document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

document.querySelector('form').onsubmit = function () {
  let tempR = document.getElementById('compose-recipients').value;
  let tempS = document.getElementById('compose-subject').value;
  let tempB = document.getElementById('compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: tempR,
      subject: tempS,
      body: tempB,
    })
  })
    .then(response => response.json())
    .then(result => console.log(result))
    .then(() => load_mailbox('sent'))
  return false;
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mailcontent-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mailcontent-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  let url = '/emails/' + mailbox;
  fetch(url)
    .then(response => response.json())
    .then(result => {

      let tbl = document.createElement('table');
      for (let i = 0; i < result.length; i++) {

        let td = document.createElement('td');
        td.appendChild(document.createTextNode(result[i]["id"]));
        td.appendChild(document.createTextNode(result[i]["sender"]));
        td.appendChild(document.createTextNode(result[i]["subject"]));
        td.appendChild(document.createTextNode(result[i]["tamp"]));
        let tr = document.createElement('tr');
        tr.appendChild(td);
        let icon = document.createElement('div')
        if (mailbox == 'inbox') {


          icon.style.backgroundImage = "url(https://cdn.icon-icons.com/icons2/1509/PNG/512/archive_104193.png)";
          icon.classList.add('icon');

          let tooltiptext = document.createElement('span');
          tooltiptext.innerHTML = 'archive';
          tooltiptext.classList.add('tiptext');

          icon.appendChild(tooltiptext);

          let td = document.createElement('td');
          icon.appendChild(tooltiptext);

          // td.appendChild(icon); 
          tr.appendChild(icon);

          if (result[i]["read"] == true) {
            tr.style.background = '#f0f0f0';
          }

        }
        tbl.appendChild(tr);
        icon.addEventListener('click', function (e) {
          e.stopPropagation();
          let url = '/emails/' + e.target.previousElementSibling.childNodes[0].nodeValue;
          fetch(url, {
            method: "PUT",
            body: JSON.stringify({
              archived: true,
            })
          })


        })
        // $(staticAncestors).on(eventName, dynamicChild, function() {});
        // $(document).on('click','#btnPrepend',function(){//do something})
        document.querySelector('#emails-view').appendChild(tbl);
        tr.addEventListener('click', (e) => {
          // console.log(e.target.childNodes[0]);
          // let temp=e.target.childNodes[0].nodeValue;
          //  console(temp);
          // $('.myTable tr td').each(function() {

          //   //First child of td
          //   var firstChild = $(this).children(':first');
          //   alert(firstChild.text());

          // });
          view_email(e.target.childNodes[0].nodeValue);
        });

      }
    })

}


function view_email(email_id) {
  let url = '/emails/' + email_id;

  fetch(url, {
    method: 'PUT',
    body: JSON.stringify({
      read: true,
    })
  })
    .then(response => response.json)
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

          let bt = document.createElement('button');
          bt.classList.add('btn', 'btn-sm', 'btn-outline-primary');
          bt.innerHTML = "Reply";

          let content = document.createElement('div');
          content.id = "email-content";
          let p = document.createElement('p');
          p.innerHTML = result.body
          content.appendChild(p);

          let hr1=document.createElement('hr');
          let hr2=document.createElement('hr');

          bt.addEventListener('click', function () {
            console.log('reply');
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'block';
            document.querySelector('#mailcontent-view').style.display = 'none';

            document.querySelector('#compose-recipients').value = result.sender;
            document.querySelector('#compose-subject').value = 'Re: ' + result.subject;
            document.querySelector('#compose-body').value = 'On ' + result.tamp + result.sender + ' wrote: ';
          });

          // document.querySelector('#mailcontent-view').innerHTML =
          //   from.outerHTML + to.outerHTML + sub.outerHTML + tamp.outerHTML + "<hr>" + content.outerHTML + '<hr>' + bt.outerHTML;
          document.querySelector('#mailcontent-view').append(from,to,sub,tamp,hr1,content,hr2,bt);
      
        })
    )


}

// $("#tbID").append("<tr><td class='labelTd'>文件名</td><td>对应合同</td><tr>");

