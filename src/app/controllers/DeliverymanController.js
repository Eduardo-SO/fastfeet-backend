import * as Yup from 'yup';

import User from '../models/User';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Delivery from '../models/Delivery';

class DeliverymanController {
    async index(req, res) {
        const deliverymen = await Deliveryman.findAll();

        return res.json(deliverymen);
    }

    async show(req, res) {
        const deliveries = await Delivery.findAll({
            where: {
                deliveryman_id: req.params.id,
            },
        });

        return res.json(deliveries);
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().required(),
            avatar_id: Yup.number().notRequired(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const user = await User.findOne({ where: { id: req.userId } });

        if (!user.provider) {
            return res.status(401).json({ error: 'User is not a provider' });
        }

        const { email, avatar_id } = req.body;

        const deliverymanExists = await Deliveryman.findOne({
            where: { email },
        });

        if (deliverymanExists) {
            return res
                .status(401)
                .json({ error: 'Deliveryman already exists' });
        }

        if (avatar_id) {
            const avatarExists = await File.findByPk(avatar_id);

            if (!avatarExists) {
                return res
                    .status(400)
                    .json({ error: 'This avatar does not exists' });
            }
        }

        const deliveryman = await Deliveryman.create(req.body);

        return res.json(deliveryman);
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().required(),
            avatar_id: Yup.number(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { id } = req.params;

        const deliveryman = await Deliveryman.findByPk(id);

        if (!deliveryman) {
            return res
                .status(400)
                .json({ error: 'This deliveryman does not exist' });
        }

        const { name, email, avatar_id } = req.body;

        if (avatar_id) {
            const avatarExists = await File.findByPk(avatar_id);
            if (!avatarExists) {
                return res
                    .status(400)
                    .json({ error: 'This avatar does not exist' });
            }
        }

        await deliveryman.update({
            id,
            name,
            email,
            avatar_id,
        });

        return res.json(deliveryman);
    }

    async delete(req, res) {
        const { id } = req.params;

        const deliveryman = await Deliveryman.findByPk(id);

        if (!deliveryman) {
            return res
                .status(400)
                .json({ error: 'This deliveryman does not exist' });
        }

        await deliveryman.destroy();

        return res.status(204).json();
    }
}

export default new DeliverymanController();
