'use strict'

const ValidationContract = require('../validators/fluent-validator');
const repository = require('../repositories/custumer-repository');
const md5 = require('md5');
const emailService = require('../services/email-service');
const authService = require('../services/auth-service');

exports.post = async(req,res,next) => {
    let contract = new ValidationContract();
    contract.hasMinLen(req.body.name,4,'O nome deve ter pelo menos 3 caracteres');
    contract.isEmail(req.body.email,'E-mail inválido');
    contract.hasMinLen(req.body.password,6,'A senha deve ter pelo menos 6 caracteres');

    //se os dados foram inválidos
    if(!contract.isValid()){
        res.status(400).send(contract.errors()).end();
        return;
    }
    try{
        await repository.create({
            name: req.body.name,
            email:req.body.email,
            password:md5(req.body.password + global.SALT_KEY),
            roles:["user"]
        });
        emailService.send(
            req.body.email,
            'Bem vindo ao Node API',
            global.EMAIL_TMPL.replace('{0}',req.body.name));
        res.status(201).send({ 
            message:'Cliente cadastrado com sucesso!'
        });
    }catch(e){
        res.status(500).send({
            message:'Falha ao processar sua requisição'
        });
    }    
    
};

exports.authenticate = async(req, res, next) => {
    try {
        const custumer = await repository.authenticate({
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY)
        });

        if (!custumer) {
            res.status(404).send({
                message: 'Usuário ou senha inválidos'
            });
            return;
        }

        const token = await authService.generateToken({
            id:custumer._id,
            email: custumer.email,
            name: custumer.name,
            roles:custumer.roles
        });

        res.status(201).send({
            token: token,
            data: {
                email: custumer.email,
                name: custumer.name
            }
        });
    } catch (e) {
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }
};

exports.refreshToken = async(req, res, next) => {
    try {
        const token = req.body.token || req.query.token || req.headers['x-access-token'];
        const data = await authService.decodeToken(token);

        const custumer = await repository.getById(data.id);

        if (!custumer) {
            res.status(404).send({
                message: 'Cliente não encontrado'
            });
            return;
        }

        const tokenData = await authService.generateToken({
            id: custumer._id,
            email: custumer.email,
            name: custumer.name,
            roles: custumer.roles
        });

        res.status(201).send({
            token: token,
            data: {
                email: custumer.email,
                name: custumer.name
            }
        });
    } catch (e) {
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }
};